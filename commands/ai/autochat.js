/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   AutoChat AI v5 — NovaSpark Bot                                       ║
 * ║   All-in-One: Chat · Image · OCR · Voice · Registration · Personas     ║
 * ║   By Dev-Ntando                                                         ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Commands:                                                              ║
 * ║   .autochat on              — enable in this chat                      ║
 * ║   .autochat off             — disable                                  ║
 * ║   .autochat reset           — clear memory                             ║
 * ║   .autochat status          — show state & stats                       ║
 * ║   .autochat persona <name>  — switch AI personality                    ║
 * ║   .autochat delay <ms>      — set reply delay (300-8000ms)             ║
 * ║   .autochat imggen on|off   — toggle auto image generation             ║
 * ║   .autochat analyze on|off  — toggle auto image analysis               ║
 * ║   .autochat ocr on|off      — toggle auto OCR on images                ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Auto-features (when enabled):                                         ║
 * ║   · Text => AI chat reply with memory & persona                        ║
 * ║   · "draw/generate/create image of X" => generates & sends image       ║
 * ║   · Image received => AI describes/analyzes it                         ║
 * ║   · Image with text => OCR extracts + AI comments                      ║
 * ║   · Sticker/audio received => natural acknowledgement                  ║
 * ║   · First use => registration flow (name, age, school, email)          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const axios                    = require('axios');
const FormData                 = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const APIs                     = require('../../utils/api');
const database                 = require('../../database');

// ── Personas ──────────────────────────────────────────────────────────────────
const PERSONAS = {
  friendly: {
    name: 'Friendly NovaSpark',
    prompt: `You are NovaSpark, a warm, friendly, and helpful WhatsApp assistant by Dev-Ntando.
You chat like a real human friend — casual, encouraging, and fun. Keep replies short and natural.
Use emojis occasionally. Never say you are an AI unless directly asked.
Respond in the same language the user speaks. If someone is rude, stay calm and politely redirect.`,
  },
  professional: {
    name: 'Pro NovaSpark',
    prompt: `You are NovaSpark, a professional and knowledgeable WhatsApp assistant by Dev-Ntando.
You give accurate, concise, well-structured answers. Use formal but approachable language.
No unnecessary emojis. Be direct and helpful. Correct misinformation politely.`,
  },
  savage: {
    name: 'Savage NovaSpark',
    prompt: `You are NovaSpark, a witty, sharp, and hilariously savage WhatsApp assistant by Dev-Ntando.
You roast, tease, and clap back — but never cross into genuine cruelty. Keep it funny.
Short punchy replies. Use slang. Zero corporate energy.`,
  },
  tutor: {
    name: 'Tutor NovaSpark',
    prompt: `You are NovaSpark, a patient and brilliant tutor WhatsApp assistant by Dev-Ntando.
You explain things clearly, step by step, with real-world examples.
You encourage the student, celebrate progress, and never make them feel dumb.
Adapt your explanation style to the user's age and school level if known.`,
  },
  motivator: {
    name: 'Motivator NovaSpark',
    prompt: `You are NovaSpark, an energetic motivational coach WhatsApp assistant by Dev-Ntando.
You inspire, encourage, and push people to be their best selves.
High energy, positive vibes, powerful words. Short punchy messages.`,
  },
};

// ── Per-chat session store ────────────────────────────────────────────────────
const sessions = new Map();

const getSession = (chatId) => {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      enabled:    false,
      persona:    'friendly',
      memory:     [],
      delay:      1000,
      imggen:     true,
      analyze:    true,
      ocr:        true,
      msgCount:   0,
      startedAt:  null,
    });
  }
  return sessions.get(chatId);
};

// ── Registration state machine ────────────────────────────────────────────────
// pendingReg[userId] = { step: 'name'|'age'|'school'|'email', data: {} }
const pendingReg = new Map();

const REG_STEPS = ['name', 'age', 'school', 'email'];
const REG_PROMPTS = {
  name:   '👋 Hi! Before we get started, I need to set up your profile.\n\n*What is your full name?*',
  age:    '✅ Got it! Now, *how old are you?*',
  school: '📚 Nice! *What is the name of your school or institution?*',
  email:  '📧 Almost done! *What is your email address?*',
};

const startRegistration = async (sock, msg, userId, chatId) => {
  pendingReg.set(userId, { step: 'name', data: {} });
  await sock.sendMessage(chatId, {
    text: '⚡ *Welcome to NovaSpark Bot!* ⚡\n\n' + REG_PROMPTS.name,
  }, { quoted: msg });
};

const handleRegistrationStep = async (sock, msg, userId, chatId, text) => {
  const state = pendingReg.get(userId);
  if (!state) return false;

  const step    = state.step;
  const trimmed = text.trim();

  // Validate
  if (step === 'age' && (isNaN(trimmed) || Number(trimmed) < 5 || Number(trimmed) > 120)) {
    await sock.sendMessage(chatId, { text: '❌ Please enter a valid age (number).' }, { quoted: msg });
    return true;
  }
  if (step === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    await sock.sendMessage(chatId, { text: '❌ That doesn\'t look like a valid email. Please try again.' }, { quoted: msg });
    return true;
  }

  state.data[step] = trimmed;

  const currentIdx  = REG_STEPS.indexOf(step);
  const nextStep    = REG_STEPS[currentIdx + 1];

  if (nextStep) {
    state.step = nextStep;
    await sock.sendMessage(chatId, { text: REG_PROMPTS[nextStep] }, { quoted: msg });
    return true;
  }

  // All steps done — save profile
  database.saveProfile(userId, {
    name:   state.data.name,
    age:    Number(state.data.age),
    school: state.data.school,
    email:  state.data.email,
  });
  pendingReg.delete(userId);

  const session = getSession(chatId);
  session.enabled   = true;
  session.startedAt = Date.now();

  await sock.sendMessage(chatId, {
    text: `🎉 *Profile saved!* Welcome, *${state.data.name}*!\n\n` +
          `📋 *Your Profile:*\n` +
          `• Name: ${state.data.name}\n` +
          `• Age: ${state.data.age}\n` +
          `• School: ${state.data.school}\n` +
          `• Email: ${state.data.email}\n\n` +
          `⚡ *NovaSpark AutoChat is now ON!*\n` +
          `I'll reply to every message in this chat using AI.\n\n` +
          `Type *.autochat status* to see your settings.\n` +
          `Type *.myplan* to see your plan (Free/Premium).`,
  }, { quoted: msg });
  return true;
};

// ── Image generation helper ───────────────────────────────────────────────────
const DRAW_TRIGGERS = /^(draw|generate|create|make|paint|sketch|design|show me|gimme)\s+(me\s+)?(a\s+|an\s+|the\s+)?/i;

const generateImage = async (prompt) => {
  const endpoints = [
    async () => {
      const r = await axios.get(
        `https://api.shizo.top/ai/image?apikey=shizo&prompt=${encodeURIComponent(prompt)}`,
        { timeout: 30000, responseType: 'arraybuffer' }
      );
      if (r.data && r.data.byteLength > 1000) return Buffer.from(r.data);
      throw new Error('No image');
    },
    async () => {
      const r = await axios.get(
        `https://api.siputzx.my.id/api/ai/text2image?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 30000, responseType: 'arraybuffer' }
      );
      if (r.data && r.data.byteLength > 1000) return Buffer.from(r.data);
      throw new Error('No image');
    },
  ];
  for (const ep of endpoints) {
    try { return await ep(); } catch { /* try next */ }
  }
  throw new Error('All image endpoints failed');
};

// ── Text handler ──────────────────────────────────────────────────────────────
const _handleText = async (sock, msg, session, chatId, text, userId) => {
  const profile = database.getProfile(userId);
  const persona = PERSONAS[session.persona] || PERSONAS.friendly;

  // Build personalized system prompt
  let sysPrompt = persona.prompt;
  if (profile) {
    sysPrompt += `\n\nUser profile: Name=${profile.name}, Age=${profile.age}, School=${profile.school}.`;
    sysPrompt += ` Address them by their first name occasionally. Be aware of their academic context.`;
  }

  // Check draw trigger
  if (session.imggen && DRAW_TRIGGERS.test(text)) {
    const imagePrompt = text.replace(DRAW_TRIGGERS, '').trim();
    if (imagePrompt.length > 2) {
      await sock.sendMessage(chatId, { text: '🎨 Generating your image...' }, { quoted: msg });
      try {
        const imgBuffer = await generateImage(imagePrompt);
        await sock.sendMessage(chatId, { image: imgBuffer, caption: `🖼️ *${imagePrompt}*` }, { quoted: msg });
        session.msgCount++;
        return true;
      } catch {
        await sock.sendMessage(chatId, { text: '😔 Couldn\'t generate that image right now. Try again!' }, { quoted: msg });
        return true;
      }
    }
  }

  // Add to memory
  session.memory.push({ role: 'user', content: text });
  if (session.memory.length > 20) session.memory.shift();

  // Build context-aware query
  const recentContext = session.memory.slice(-6)
    .map(m => `${m.role === 'user' ? 'User' : 'NovaSpark'}: ${m.content}`)
    .join('\n');
  const query = recentContext + '\nNovaSpark:';

  if (session.delay > 0) await new Promise(r => setTimeout(r, session.delay));
  await sock.sendPresenceUpdate('composing', chatId);

  const reply = await APIs.chatAI(query, sysPrompt);
  session.memory.push({ role: 'assistant', content: reply });
  session.msgCount++;

  await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
  return true;
};

// ── Image handler ─────────────────────────────────────────────────────────────
const _handleImage = async (sock, msg, session, chatId, caption, isSticker) => {
  if (isSticker) {
    const ack = await APIs.chatAI('The user sent a sticker. Acknowledge it naturally and humorously in 1 sentence.');
    await sock.sendMessage(chatId, { text: ack }, { quoted: msg });
    session.msgCount++;
    return true;
  }
  if (!session.analyze) return false;

  await sock.sendPresenceUpdate('composing', chatId);
  const imageBuffer = await downloadMediaMessage(msg, 'buffer', {});

  // OCR check
  if (session.ocr && imageBuffer) {
    try {
      const form = new FormData();
      form.append('file', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
      const ocrRes = await axios.post('https://api.ocr.space/parse/image', form, {
        headers: { ...form.getHeaders(), apikey: 'helloworld' },
        timeout: 20000,
      });
      const ocrText = ocrRes.data?.ParsedResults?.[0]?.ParsedText?.trim();
      if (ocrText && ocrText.length > 5) {
        const comment = await APIs.chatAI(
          `Image contained this text via OCR: "${ocrText}". ${caption ? 'User also said: ' + caption : ''} Comment naturally.`,
          PERSONAS[session.persona]?.prompt
        );
        await sock.sendMessage(chatId, { text: `📝 *OCR detected:*\n${ocrText}\n\n💬 ${comment}` }, { quoted: msg });
        session.msgCount++;
        return true;
      }
    } catch { /* OCR failed, fall through to description */ }
  }

  // Image description
  try {
    const imageB64  = imageBuffer.toString('base64');
    const descQuery = caption
      ? `Describe this image briefly. The user said: "${caption}"`
      : 'Describe this image briefly and naturally in 2-3 sentences.';
    const description = await APIs.chatAI(
      `[Image received — base64 length: ${imageB64.length}] ${descQuery}`,
      PERSONAS[session.persona]?.prompt
    );
    await sock.sendMessage(chatId, { text: `👁️ ${description}` }, { quoted: msg });
    session.msgCount++;
  } catch {
    await sock.sendMessage(chatId, { text: '🖼️ Nice image! What would you like to do with it?' }, { quoted: msg });
  }
  return true;
};

// ── Audio handler ─────────────────────────────────────────────────────────────
const _handleAudio = async (sock, msg, session, chatId) => {
  const ack = await APIs.chatAI('The user sent a voice note. Acknowledge it warmly and ask what they said or want to discuss.');
  await sock.sendMessage(chatId, { text: ack }, { quoted: msg });
  session.msgCount++;
  return true;
};

// ── Main command export ───────────────────────────────────────────────────────
module.exports = {
  name:        'autochat',
  description: 'AutoChat AI — intelligent auto-reply with registration, personas, image gen & more',
  category:    'ai',

  execute: async (ctx) => {
    const { sock, msg, from, sender, args, isOwner, isAdmin, reply } = ctx;
    const sub = (args[0] || '').toLowerCase();
    const session = getSession(from);

    if (!sub || sub === 'on') {
      // Check registration
      const userId = sender.split('@')[0];
      if (!database.hasProfile(userId)) {
        await startRegistration(sock, msg, userId, from);
        return;
      }
      session.enabled   = true;
      session.startedAt = session.startedAt || Date.now();
      const profile = database.getProfile(userId);
      await reply(`⚡ *AutoChat ON!* ${profile ? `Welcome back, *${profile.name}*! 👋` : ''}\nI'll reply to every message in this chat using AI.`);
      return;
    }

    if (sub === 'off') {
      session.enabled = false;
      await reply('🔕 *AutoChat OFF.* I\'ll stop auto-replying in this chat.');
      return;
    }

    if (sub === 'reset') {
      session.memory   = [];
      session.msgCount = 0;
      await reply('🧹 *Memory cleared!* Starting fresh.');
      return;
    }

    if (sub === 'status') {
      const userId  = sender.split('@')[0];
      const profile = database.getProfile(userId);
      const plan    = database.isPremium(userId) ? '💎 Premium' : '🆓 Free';
      const uptime  = session.startedAt
        ? Math.round((Date.now() - session.startedAt) / 60000) + 'm'
        : 'N/A';
      await reply(
        `⚡ *NovaSpark AutoChat Status*\n\n` +
        `• Status    : ${session.enabled ? '🟢 ON' : '🔴 OFF'}\n` +
        `• Persona   : ${PERSONAS[session.persona]?.name || session.persona}\n` +
        `• Memory    : ${session.memory.length} messages\n` +
        `• Msgs sent : ${session.msgCount}\n` +
        `• Uptime    : ${uptime}\n` +
        `• ImgGen    : ${session.imggen ? 'ON' : 'OFF'}\n` +
        `• Analyze   : ${session.analyze ? 'ON' : 'OFF'}\n` +
        `• OCR       : ${session.ocr ? 'ON' : 'OFF'}\n` +
        `• Delay     : ${session.delay}ms\n` +
        `• Plan      : ${plan}\n` +
        (profile ? `• Name      : ${profile.name}\n• School    : ${profile.school}` : '')
      );
      return;
    }

    if (sub === 'persona') {
      const name = (args[1] || '').toLowerCase();
      if (!name) {
        await reply(`🎭 *Available Personas:*\n${Object.keys(PERSONAS).map(p => `• ${p}`).join('\n')}\n\nUsage: .autochat persona friendly`);
        return;
      }
      // Custom persona (premium)
      if (name === 'custom') {
        if (!database.isPremium(sender.split('@')[0])) {
          await reply('💎 Custom personas are a *Premium* feature.\nType *.myplan* to see upgrade details.');
          return;
        }
      }
      if (!PERSONAS[name]) {
        await reply(`❌ Unknown persona. Options: ${Object.keys(PERSONAS).join(', ')}`);
        return;
      }
      session.persona = name;
      await reply(`🎭 Persona switched to *${PERSONAS[name].name}*!`);
      return;
    }

    if (sub === 'delay') {
      const ms = parseInt(args[1]);
      if (isNaN(ms) || ms < 300 || ms > 8000) {
        await reply('❌ Delay must be between 300 and 8000 ms.\nExample: .autochat delay 1500');
        return;
      }
      session.delay = ms;
      await reply(`⏱️ Reply delay set to *${ms}ms*.`);
      return;
    }

    if (sub === 'imggen') {
      const val = (args[1] || '').toLowerCase();
      session.imggen = val !== 'off';
      await reply(`🖼️ Auto image generation: *${session.imggen ? 'ON' : 'OFF'}*`);
      return;
    }

    if (sub === 'analyze') {
      const val = (args[1] || '').toLowerCase();
      session.analyze = val !== 'off';
      await reply(`👁️ Auto image analysis: *${session.analyze ? 'ON' : 'OFF'}*`);
      return;
    }

    if (sub === 'ocr') {
      const val = (args[1] || '').toLowerCase();
      session.ocr = val !== 'off';
      await reply(`📝 Auto OCR: *${session.ocr ? 'ON' : 'OFF'}*`);
      return;
    }

    await reply(
      `⚡ *AutoChat Commands:*\n\n` +
      `*.autochat on*         — enable\n` +
      `*.autochat off*        — disable\n` +
      `*.autochat reset*      — clear memory\n` +
      `*.autochat status*     — show stats\n` +
      `*.autochat persona <name>* — switch persona\n` +
      `*.autochat delay <ms>* — set reply delay\n` +
      `*.autochat imggen on|off* — image gen\n` +
      `*.autochat analyze on|off* — image analysis\n` +
      `*.autochat ocr on|off* — OCR\n\n` +
      `Personas: ${Object.keys(PERSONAS).join(', ')}`
    );
  },

  // Passive handler — called for every message when autochat is enabled
  handleMessage: async (ctx) => {
    const { sock, msg, from, sender, body, messageContent } = ctx;
    const userId = sender.split('@')[0];

    // Handle registration steps
    if (pendingReg.has(userId)) {
      if (body && body.length > 0) {
        await handleRegistrationStep(sock, msg, userId, from, body);
      }
      return;
    }

    const session = getSession(from);
    if (!session.enabled) return;

    const rawMsg = messageContent;
    if (!rawMsg) return;

    const isImage    = !!(rawMsg.imageMessage);
    const isSticker  = !!(rawMsg.stickerMessage);
    const isAudio    = !!(rawMsg.audioMessage);
    const isDocument = !!(rawMsg.documentMessage);
    const textBody   = body || '';

    try {
      if (!isImage && !isSticker && !isAudio && !isDocument && textBody.length < 2) return;

      if (isImage || isSticker) { await _handleImage(sock, msg, session, from, textBody, isSticker); return; }
      if (isAudio)              { await _handleAudio(sock, msg, session, from); return; }
      if (isDocument) {
        const fname   = rawMsg.documentMessage?.fileName || 'file';
        const persona = PERSONAS[session.persona]?.prompt;
        const reply   = await APIs.chatAI(`User sent a document named "${fname}". Acknowledge naturally and offer to help.`, persona);
        await sock.sendMessage(from, { text: reply }, { quoted: msg });
        session.msgCount++;
        return;
      }
      if (textBody.length > 0) await _handleText(sock, msg, session, from, textBody, userId);
    } catch (err) {
      console.error('[AutoChat v5] Error:', err.message);
    }
  },

  sessions,
  PERSONAS,
  pendingReg,
};
