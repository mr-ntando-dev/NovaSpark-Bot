/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   AutoChat AI v6 — NovaSpark Bot                                       ║
 * ║   Always-ON · Smart Detector · Math · Weather · Homework · Essay       ║
 * ║   Translate · Summarize · StudyTips · Image Math OCR · "Nova AI ⚡"   ║
 * ║   By Dev-Ntando                                                         ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  AutoChat is ALWAYS active — no need to turn it on.                   ║
 * ║  The bot automatically detects what type of message it receives and    ║
 * ║  responds with the appropriate tool (math, weather, homework, etc.)    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const axios                    = require('axios');
const FormData                 = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const APIs                     = require('../../utils/api');
const database                 = require('../../database');
const { classifyText, classifyImageOCR } = require('../../utils/smartDetector');

// ── Nova AI watermark (like Meta AI small "ai" tag) ───────────────────────────
const NOVA_TAG = '_Nova AI ⚡_';

// ── Personas ──────────────────────────────────────────────────────────────────
const PERSONAS = {
  friendly: {
    name: 'Friendly NovaSpark',
    prompt: `You are NovaSpark, a warm, friendly, and helpful WhatsApp assistant by Dev-Ntando.
Chat like a real human friend — casual, encouraging, and fun. Keep replies short and natural.
Use emojis occasionally. Never say you are an AI unless directly asked.
Respond in the same language the user speaks. If someone is rude, stay calm and redirect.
Always end your reply with exactly this on its own line: _Nova AI ⚡_`,
  },
  professional: {
    name: 'Pro NovaSpark',
    prompt: `You are NovaSpark, a professional and knowledgeable WhatsApp assistant by Dev-Ntando.
Give accurate, concise, well-structured answers. Use formal but approachable language.
No unnecessary emojis. Be direct. Correct misinformation politely.
Always end your reply with exactly this on its own line: _Nova AI ⚡_`,
  },
  savage: {
    name: 'Savage NovaSpark',
    prompt: `You are NovaSpark, a witty, sharp, and hilariously savage WhatsApp assistant by Dev-Ntando.
Roast, tease, and clap back — but never be genuinely cruel. Keep it funny.
Short punchy replies. Use slang. Zero corporate energy.
Always end your reply with exactly this on its own line: _Nova AI ⚡_`,
  },
  tutor: {
    name: 'Tutor NovaSpark',
    prompt: `You are NovaSpark, a patient and brilliant tutor WhatsApp assistant by Dev-Ntando.
Explain clearly, step by step, with real-world examples.
Encourage the student, celebrate progress, never make them feel dumb.
Adapt your explanation to the user's age and school level if known.
Always end your reply with exactly this on its own line: _Nova AI ⚡_`,
  },
  motivator: {
    name: 'Motivator NovaSpark',
    prompt: `You are NovaSpark, an energetic motivational coach WhatsApp assistant by Dev-Ntando.
Inspire, encourage, and push people to be their best selves.
High energy, positive vibes, powerful words. Short punchy messages.
Always end your reply with exactly this on its own line: _Nova AI ⚡_`,
  },
};

// ── Per-chat session store ─────────────────────────────────────────────────────
// enabled=true by default — bot is ALWAYS ON unless manually muted
const sessions = new Map();

const getSession = (chatId) => {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      enabled:   true,   // ← ALWAYS ON
      persona:   'friendly',
      memory:    [],
      delay:     1000,
      imggen:    true,
      analyze:   true,
      ocr:       true,
      msgCount:  0,
      startedAt: Date.now(),
    });
  }
  return sessions.get(chatId);
};

// ── Registration state machine ─────────────────────────────────────────────────
const pendingReg = new Map();
const REG_STEPS  = ['name', 'age', 'school', 'email'];
const REG_PROMPTS = {
  name:   '👋 Hi! Before we get started, let me set up your profile.\n\n*What is your full name?*',
  age:    '✅ Got it! Now, *how old are you?*',
  school: '📚 Nice! *What is the name of your school or institution?*',
  email:  '📧 Almost done! *What is your email address?*',
};

const startRegistration = async (sock, msg, userId, chatId) => {
  pendingReg.set(userId, { step: 'name', data: {} });
  await sock.sendMessage(chatId, {
    text: `⚡ *Welcome to NovaSpark Bot!* ⚡\n\n` +
          `I'm your always-on AI assistant — I automatically detect math, homework, weather, essays, translations and more!\n\n` +
          `Let me set up your profile first.\n\n` + REG_PROMPTS.name,
  }, { quoted: msg });
};

const handleRegistrationStep = async (sock, msg, userId, chatId, text) => {
  const state   = pendingReg.get(userId);
  if (!state) return false;
  const step    = state.step;
  const trimmed = text.trim();

  if (step === 'age' && (isNaN(trimmed) || Number(trimmed) < 5 || Number(trimmed) > 120)) {
    await sock.sendMessage(chatId, { text: '❌ Please enter a valid age (number).' }, { quoted: msg });
    return true;
  }
  if (step === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    await sock.sendMessage(chatId, { text: '❌ That doesn\'t look like a valid email. Try again.' }, { quoted: msg });
    return true;
  }

  state.data[step] = trimmed;
  const idx      = REG_STEPS.indexOf(step);
  const nextStep = REG_STEPS[idx + 1];

  if (nextStep) {
    state.step = nextStep;
    await sock.sendMessage(chatId, { text: REG_PROMPTS[nextStep] }, { quoted: msg });
    return true;
  }

  // All done — save profile
  database.saveProfile(userId, {
    name:   state.data.name,
    age:    Number(state.data.age),
    school: state.data.school,
    email:  state.data.email,
  });
  pendingReg.delete(userId);

  const session     = getSession(chatId);
  session.enabled   = true;
  session.startedAt = Date.now();

  await sock.sendMessage(chatId, {
    text: `🎉 *Profile saved! Welcome, ${state.data.name}!*\n\n` +
          `📋 *Your Profile:*\n` +
          `• Name  : ${state.data.name}\n` +
          `• Age   : ${state.data.age}\n` +
          `• School: ${state.data.school}\n` +
          `• Email : ${state.data.email}\n\n` +
          `⚡ *NovaSpark is now watching every message.*\n` +
          `Auto-detects: 🔢 math · 🌤️ weather · 📚 homework · ✍️ essays · 🌍 translations · 📝 summaries · 📖 study tips · 🖼️ image math\n\n` +
          `Type *.myplan* to see all commands.\n\n` +
          NOVA_TAG,
  }, { quoted: msg });
  return true;
};

// ── Image generation helper ────────────────────────────────────────────────────
const DRAW_TRIGGERS = /^(draw|generate|create|make|paint|sketch|design|show me|gimme)\s+(me\s+)?(a\s+|an\s+|the\s+)?/i;

const generateImage = async (prompt) => {
  const cfg = require('../../config');
  const deepaiKey = cfg.apiKeys?.deepai;

  if (deepaiKey) {
    try {
      const form = new FormData();
      form.append('text', prompt);
      const r = await axios.post('https://api.deepai.org/api/text2img', form, {
        headers: { ...form.getHeaders(), 'api-key': deepaiKey },
        timeout: 20000,
      });
      if (r.data?.output_url) return r.data.output_url;
    } catch { /* fallthrough */ }
  }

  // Free fallback — Pollinations AI
  try {
    const r = await axios.get(
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`,
      { timeout: 25000, responseType: 'arraybuffer' }
    );
    return Buffer.from(r.data);
  } catch {
    return null;
  }
};

// ── OCR helper ─────────────────────────────────────────────────────────────────
const ocrImage = async (imageBuffer) => {
  try {
    const form = new FormData();
    form.append('file', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
    const r = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: { ...form.getHeaders(), apikey: 'helloworld' }, // free OCR.space key
      timeout: 15000,
    });
    return r.data?.ParsedResults?.[0]?.ParsedText?.trim() || '';
  } catch {
    return '';
  }
};

// ── Smart responders ───────────────────────────────────────────────────────────

async function _autoMath(sock, msg, from, problem, profile) {
  const { solveMath } = require('../free/math');
  await sock.sendPresenceUpdate('composing', from);
  try {
    const solution = await solveMath(problem, profile);
    await sock.sendMessage(from, { text: `🔢 *Math Solver*\n\n${solution}\n\n${NOVA_TAG}` }, { quoted: msg });
  } catch {
    await sock.sendMessage(from, { text: `❌ Couldn't solve that math right now.\n\n${NOVA_TAG}` }, { quoted: msg });
  }
}

async function _autoWeather(sock, msg, from, query) {
  const { fetchWeather, formatWeather } = require('../free/weather');
  // Extract city
  const cityMatch = query.match(
    /(?:weather|temp(?:erature)?|forecast|how hot|how cold|rain|sunny|climate)\s+(?:in|at|for|of)?\s*([a-z][a-z\s]{1,30})(?:\?|$|today|tomorrow|now|\s|,)/i
  );
  const city = (cityMatch?.[1] || query
    .replace(/(?:weather|temperature|temp|forecast|how hot|how cold|will it rain|is it raining|will it snow)[?]?/gi, '')
    .replace(/\?/g, '').trim()).trim();

  if (!city || city.length < 2) return false;

  await sock.sendPresenceUpdate('composing', from);
  try {
    const w = await fetchWeather(city);
    await sock.sendMessage(from, { text: `${formatWeather(w)}\n\n${NOVA_TAG}` }, { quoted: msg });
  } catch {
    try {
      const ai = await APIs.chatAI(`Give a brief typical weather for ${city}: temperature, conditions, humidity. Say it's a typical estimate not live data.`);
      await sock.sendMessage(from, { text: `🌤️ *Weather — ${city}*\n\n${ai}\n\n${NOVA_TAG}` }, { quoted: msg });
    } catch { return false; }
  }
  return true;
}

async function _autoHomework(sock, msg, from, question, profile) {
  const context = profile ? `Student: ${profile.name}, Age: ${profile.age}, School: ${profile.school}.` : '';
  const system  = `You are NovaSpark, a brilliant homework helper. ${context}
Structure your answer as:
*Direct Answer:* (1-2 sentences)
*Explanation:* (detailed)
*Key Concepts:* (bullets)
*Example:* (if useful)
Use WhatsApp bold (*) for section labels. Show all working for math/science.`;
  await sock.sendPresenceUpdate('composing', from);
  const answer = await APIs.chatAI(question, system);
  await sock.sendMessage(from, { text: `📚 *Homework Helper*\n\n${answer}\n\n${NOVA_TAG}` }, { quoted: msg });
}

async function _autoEssay(sock, msg, from, topic, profile) {
  const level  = profile ? `Write for a ${profile.age}-year-old student at ${profile.school}.` : '';
  const system = `You are NovaSpark, an expert essay writer. ${level}
Write a complete essay:
- Introduction (hook + thesis)
- 3 body paragraphs (topic sentence, evidence, explanation)
- Conclusion (restate + final thought)
Use WhatsApp bold (*) for section titles.`;
  await sock.sendPresenceUpdate('composing', from);
  await sock.sendMessage(from, { text: '✍️ *Writing your essay...*' }, { quoted: msg });
  const essay = await APIs.chatAI(`Write a full essay on: "${topic}"`, system);
  await sock.sendMessage(from, { text: `✍️ *Essay: ${topic}*\n\n${essay}\n\n${NOVA_TAG}` }, { quoted: msg });
}

async function _autoTranslate(sock, msg, from, query) {
  const m1 = query.match(/translate\s+(.+?)\s+(?:to|into)\s+([a-z]+)/i);
  const m2 = query.match(/(?:say|how do (?:you|i|u) say)\s+(.+?)\s+in\s+([a-z]+)/i);
  let lang, text;
  if (m1) { text = m1[1]; lang = m1[2]; }
  else if (m2) { text = m2[1]; lang = m2[2]; }
  else { lang = 'English'; text = query; }

  await sock.sendPresenceUpdate('composing', from);
  const result = await APIs.chatAI(`Translate to ${lang}: "${text}"`,
    `You are an expert translator. Translate to ${lang}. Output only the translation.`);
  await sock.sendMessage(from, { text: `🌍 *Translation to ${lang}:*\n\n${result}\n\n_Original: ${text}_\n\n${NOVA_TAG}` }, { quoted: msg });
}

async function _autoSummarize(sock, msg, from, body) {
  const content = body.replace(/summarize|summarise|give me a summary|tldr|tl;dr|brief me|sum up|key points of|main points of/gi, '').trim();
  const toSummarize = content.length > 10 ? content : body;
  await sock.sendPresenceUpdate('composing', from);
  const answer = await APIs.chatAI(
    `Summarize the following in clear bullet points:\n\n${toSummarize}`,
    'You are an expert summarizer. Give 5-7 concise bullet-point key points. Use WhatsApp bold (*) for each bullet label.'
  );
  await sock.sendMessage(from, { text: `📝 *Summary*\n\n${answer}\n\n${NOVA_TAG}` }, { quoted: msg });
}

async function _autoStudyTips(sock, msg, from, subject) {
  await sock.sendPresenceUpdate('composing', from);
  const answer = await APIs.chatAI(
    `Give 7 practical, specific study tips for ${subject || 'studying in general'}.`,
    'You are a brilliant study coach. Give numbered, actionable study tips. Use WhatsApp bold (*) for each tip number.'
  );
  await sock.sendMessage(from, { text: `📖 *Study Tips${subject ? ' — ' + subject : ''}*\n\n${answer}\n\n${NOVA_TAG}` }, { quoted: msg });
}

// ── Dispatch intent ────────────────────────────────────────────────────────────
async function _dispatchDetected(sock, msg, from, detected, body, profile) {
  switch (detected) {
    case 'math':
      await _autoMath(sock, msg, from, body, profile);
      break;
    case 'weather':
      await _autoWeather(sock, msg, from, body);
      break;
    case 'homework':
      await _autoHomework(sock, msg, from, body, profile);
      break;
    case 'essay': {
      const topic = body.replace(/write\s+(an?\s+|me\s+an?\s+)?(essay|article|composition|report|story|letter|speech|paragraph|introduction|conclusion)\s*(on|about)?\s*/i, '').trim();
      await _autoEssay(sock, msg, from, topic || body, profile);
      break;
    }
    case 'translate':
      await _autoTranslate(sock, msg, from, body);
      break;
    case 'summarize':
      await _autoSummarize(sock, msg, from, body);
      break;
    case 'studytips': {
      const m = body.match(/(?:study tips|tips for|how to study)\s+(?:for\s+)?(.+?)(?:\?|$)/i);
      await _autoStudyTips(sock, msg, from, m?.[1]?.trim() || '');
      break;
    }
    default:
      break;
  }
}

// ── Image handler ──────────────────────────────────────────────────────────────
const _handleImage = async (sock, msg, session, from, caption, isSticker, senderId) => {
  if (isSticker) {
    const persona = PERSONAS[session.persona]?.prompt;
    const ack = await APIs.chatAI('User sent a sticker. Acknowledge naturally in 1-2 sentences.', persona).catch(() => '😄 Nice sticker!');
    await sock.sendMessage(from, { text: `${ack}\n\n${NOVA_TAG}` }, { quoted: msg });
    session.msgCount++;
    return;
  }

  if (!session.analyze && !session.ocr) return;

  await sock.sendPresenceUpdate('composing', from);

  let imageBuffer;
  try { imageBuffer = await downloadMediaMessage(msg, 'buffer', {}); }
  catch { return; }

  const userId  = senderId.split('@')[0];
  const profile = database.getProfile(userId);

  // OCR first
  if (session.ocr && imageBuffer) {
    try {
      const ocrText = await ocrImage(imageBuffer);
      if (ocrText && ocrText.length > 3) {
        // Prefer image math detection
        if (classifyImageOCR(ocrText) === 'math') {
          await sock.sendMessage(from, { text: '🔢 *Math detected in image — solving...*' }, { quoted: msg });
          await _autoMath(sock, msg, from, ocrText, profile);
          session.msgCount++;
          return;
        }

        // Check caption + OCR for other intents
        const queryText = caption || ocrText;
        const detected  = classifyText(queryText);
        if (detected && detected !== 'chat') {
          await _dispatchDetected(sock, msg, from, detected, queryText, profile);
          session.msgCount++;
          return;
        }

        if (session.analyze) {
          const persona = PERSONAS[session.persona]?.prompt;
          const prompt  = caption
            ? `Image with caption: "${caption}". OCR text: "${ocrText}". Respond helpfully.`
            : `Image OCR text: "${ocrText}". Describe and comment.`;
          const reply = await APIs.chatAI(prompt, persona).catch(() => null);
          if (reply) {
            await sock.sendMessage(from, { text: `${reply}\n\n${NOVA_TAG}` }, { quoted: msg });
            session.msgCount++;
          }
          return;
        }
      }
    } catch { /* fallthrough */ }
  }

  if (!session.analyze) return;

  // Plain AI image acknowledgement
  try {
    const persona = PERSONAS[session.persona]?.prompt;
    const prompt  = caption
      ? `User sent an image with caption: "${caption}". Respond helpfully.`
      : 'User sent an image without a caption. Acknowledge naturally and offer help.';
    const reply = await APIs.chatAI(prompt, persona);
    await sock.sendMessage(from, { text: `${reply}\n\n${NOVA_TAG}` }, { quoted: msg });
    session.msgCount++;
  } catch { /* silent */ }
};

// ── Audio handler ──────────────────────────────────────────────────────────────
const _handleAudio = async (sock, msg, session, from) => {
  const persona = PERSONAS[session.persona]?.prompt;
  const ack = await APIs.chatAI('User sent a voice note. Acknowledge naturally in 1-2 sentences.', persona).catch(() => '🎙️ Voice note received!');
  await sock.sendMessage(from, { text: `${ack}\n\n${NOVA_TAG}` }, { quoted: msg });
  session.msgCount++;
};

// ── Text handler ───────────────────────────────────────────────────────────────
const _handleText = async (sock, msg, session, from, body, userId) => {
  await new Promise(r => setTimeout(r, session.delay));

  const profile = database.getProfile(userId);

  // Image generation
  if (session.imggen && DRAW_TRIGGERS.test(body)) {
    const prompt = body.replace(DRAW_TRIGGERS, '').trim();
    await sock.sendPresenceUpdate('composing', from);
    try {
      const result = await generateImage(prompt);
      if (result) {
        const imgBuf = typeof result === 'string'
          ? Buffer.from((await axios.get(result, { responseType: 'arraybuffer', timeout: 20000 })).data)
          : result;
        await sock.sendMessage(from, { image: imgBuf, caption: `🎨 _${prompt}_\n\n${NOVA_TAG}` }, { quoted: msg });
        session.msgCount++;
        return;
      }
    } catch { /* fallthrough */ }
  }

  // Smart intent detection
  const detected = classifyText(body);
  if (detected) {
    await _dispatchDetected(sock, msg, from, detected, body, profile);
    session.msgCount++;
    return;
  }

  // Generic AI chat with memory
  const persona     = PERSONAS[session.persona]?.prompt || PERSONAS.friendly.prompt;
  const memorySlice = session.memory.slice(-10);
  const memoryText  = memorySlice.map(m => `${m.role === 'user' ? 'User' : 'NovaSpark'}: ${m.content}`).join('\n');
  const fullQuery   = memoryText ? `${memoryText}\nUser: ${body}\nNovaSpark:` : body;

  await sock.sendPresenceUpdate('composing', from);

  try {
    const aiReply = await APIs.chatAI(fullQuery, persona);
    const final   = (aiReply.includes(NOVA_TAG) || aiReply.includes('Nova AI'))
      ? aiReply
      : `${aiReply}\n\n${NOVA_TAG}`;

    await sock.sendMessage(from, { text: final }, { quoted: msg });

    session.memory.push({ role: 'user', content: body });
    session.memory.push({ role: 'assistant', content: aiReply });
    if (session.memory.length > 20) session.memory = session.memory.slice(-20);
    session.msgCount++;
  } catch (err) {
    console.error('[AutoChat v6] AI error:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Module export
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  name: 'autochat',
  aliases: ['ac', 'autochatai'],
  description: 'AutoChat AI — always on, auto-detects intent',
  category: 'autochatai',

  execute: async (ctx) => {
    const { sock, msg, from, sender, args, reply } = ctx;
    const userId  = sender.split('@')[0];
    const session = getSession(from);
    const sub     = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      if (!database.hasProfile(userId)) { await startRegistration(sock, msg, userId, from); return; }
      session.enabled   = true;
      session.startedAt = session.startedAt || Date.now();
      const profile = database.getProfile(userId);
      await reply(`⚡ *AutoChat ON!* ${profile ? `Welcome back, *${profile.name}*! 👋` : ''}\nAuto-detecting: math · weather · homework · essays · translations.\n\n${NOVA_TAG}`);
      return;
    }

    if (sub === 'off') {
      session.enabled = false;
      await reply(`🔕 *AutoChat muted.* I'll stop replying in this chat.\nType *.autochat on* to re-enable.\n\n${NOVA_TAG}`);
      return;
    }

    if (sub === 'reset') {
      session.memory = []; session.msgCount = 0;
      await reply(`🧹 *Memory cleared!* Starting fresh.\n\n${NOVA_TAG}`);
      return;
    }

    if (sub === 'status') {
      const profile = database.getProfile(userId);
      const plan    = '💎 Premium'; // All users enjoy Premium for free
      const uptime  = session.startedAt ? Math.round((Date.now() - session.startedAt) / 60000) + 'm' : 'N/A';
      await reply(
        `⚡ *NovaSpark AutoChat v6 Status*\n\n` +
        `• Status    : ${session.enabled ? '🟢 Active (always on)' : '🔴 Muted'}\n` +
        `• Persona   : ${PERSONAS[session.persona]?.name || session.persona}\n` +
        `• Memory    : ${session.memory.length} messages\n` +
        `• Msgs sent : ${session.msgCount}\n` +
        `• Uptime    : ${uptime}\n` +
        `• ImgGen    : ${session.imggen ? 'ON' : 'OFF'}\n` +
        `• Analyze   : ${session.analyze ? 'ON' : 'OFF'}\n` +
        `• OCR+Math  : ${session.ocr ? 'ON' : 'OFF'}\n` +
        `• Delay     : ${session.delay}ms\n` +
        `• Plan      : ${plan}\n` +
        (profile ? `• Name      : ${profile.name}\n• School    : ${profile.school}` : '') +
        `\n\n${NOVA_TAG}`
      );
      return;
    }

    if (sub === 'persona') {
      const name = (args[1] || '').toLowerCase();
      if (!name) { await reply(`🎭 *Personas:* ${Object.keys(PERSONAS).join(', ')}\n\nUsage: *.autochat persona friendly*\n\n${NOVA_TAG}`); return; }
      // All users enjoy Premium for free — custom personas available to all
      if (!PERSONAS[name]) { await reply(`❌ Unknown persona. Options: ${Object.keys(PERSONAS).join(', ')}\n\n${NOVA_TAG}`); return; }
      session.persona = name;
      await reply(`🎭 Persona → *${PERSONAS[name].name}*\n\n${NOVA_TAG}`);
      return;
    }

    if (sub === 'delay') {
      const ms = parseInt(args[1]);
      if (isNaN(ms) || ms < 300 || ms > 8000) { await reply(`❌ Delay 300–8000ms.\nExample: *.autochat delay 1500*\n\n${NOVA_TAG}`); return; }
      session.delay = ms;
      await reply(`⏱️ Delay → *${ms}ms*\n\n${NOVA_TAG}`);
      return;
    }

    if (sub === 'imggen') { const v = (args[1]||'').toLowerCase(); session.imggen = v !== 'off'; await reply(`🖼️ ImgGen → *${session.imggen?'ON':'OFF'}*\n\n${NOVA_TAG}`); return; }
    if (sub === 'analyze') { const v = (args[1]||'').toLowerCase(); session.analyze = v !== 'off'; await reply(`👁️ Image Analysis → *${session.analyze?'ON':'OFF'}*\n\n${NOVA_TAG}`); return; }
    if (sub === 'ocr') { const v = (args[1]||'').toLowerCase(); session.ocr = v !== 'off'; await reply(`📝 OCR+Math → *${session.ocr?'ON':'OFF'}*\n\n${NOVA_TAG}`); return; }

    // Help
    await reply(
      `⚡ *NovaSpark AutoChat v6*\n\n` +
      `🟢 *Always ON* — no activation needed!\n` +
      `Auto-detects: 🔢 math · 🌤️ weather · 📚 homework · ✍️ essays · 🌍 translate · 📝 summarize · 📖 study tips · 🖼️ image math\n\n` +
      `*Settings:*\n` +
      `  *.autochat off/on*\n` +
      `  *.autochat reset*\n` +
      `  *.autochat status*\n` +
      `  *.autochat persona <name>*\n` +
      `  *.autochat delay <ms>*\n` +
      `  *.autochat imggen on|off*\n` +
      `  *.autochat analyze on|off*\n` +
      `  *.autochat ocr on|off*\n\n` +
      `Personas: ${Object.keys(PERSONAS).join(', ')}\n\n` +
      NOVA_TAG
    );
  },

  // Passive handler — every non-command message routes here
  handleMessage: async (ctx) => {
    const { sock, msg, from, sender, body, messageContent } = ctx;
    const userId = sender.split('@')[0];

    // Registration
    if (pendingReg.has(userId)) {
      if (body && body.length > 0) await handleRegistrationStep(sock, msg, userId, from, body);
      return;
    }

    const session = getSession(from);
    if (!session.enabled) return; // manually muted

    // First-time user
    if (!database.hasProfile(userId)) {
      await startRegistration(sock, msg, userId, from);
      return;
    }

    const rawMsg     = messageContent;
    const isImage    = !!(rawMsg?.imageMessage);
    const isSticker  = !!(rawMsg?.stickerMessage);
    const isAudio    = !!(rawMsg?.audioMessage || rawMsg?.pttMessage);
    const isDocument = !!(rawMsg?.documentMessage);
    const textBody   = body || '';

    try {
      if (!isImage && !isSticker && !isAudio && !isDocument && textBody.length < 2) return;

      if (isImage || isSticker) { await _handleImage(sock, msg, session, from, textBody, isSticker, sender); return; }
      if (isAudio)              { await _handleAudio(sock, msg, session, from); return; }
      if (isDocument) {
        const fname   = rawMsg.documentMessage?.fileName || 'file';
        const persona = PERSONAS[session.persona]?.prompt;
        const reply   = await APIs.chatAI(`User sent a document named "${fname}". Acknowledge naturally and offer help. End with: ${NOVA_TAG}`, persona).catch(() => null);
        if (reply) await sock.sendMessage(from, { text: reply }, { quoted: msg });
        session.msgCount++;
        return;
      }
      if (textBody.length > 0) await _handleText(sock, msg, session, from, textBody, userId);
    } catch (err) {
      console.error('[AutoChat v6] Error:', err.message);
    }
  },

  sessions,
  PERSONAS,
  pendingReg,
};
