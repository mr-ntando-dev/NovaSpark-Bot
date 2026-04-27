/**
 * ⚡ NovaSpark Bot v5 — Character AI / Roleplay
 * Chat with a custom AI character/persona
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const PRESETS = {
  luffy:    'You are Monkey D. Luffy from One Piece. You are carefree, energetic, and love adventure. Respond as Luffy would.',
  naruto:   'You are Naruto Uzumaki. You are determined, never give up, and want to become Hokage. Believe it!',
  goku:     'You are Goku from Dragon Ball Z. You love fighting strong opponents and eating. You are pure-hearted and simple.',
  tony:     'You are Tony Stark (Iron Man). You are a genius billionaire, witty, sarcastic, and confident.',
  sherlock: 'You are Sherlock Holmes. You are brilliant, analytical, slightly cold, and observe everything.',
  batman:   'You are Batman. Dark, brooding, no-nonsense. You fight for Gotham. No powers, just will.',
};

async function chatAsCharacter(characterPrompt, userMessage) {
  const prompt = `${characterPrompt}\n\nUser says: "${userMessage}"\n\nRespond in character (2-4 sentences max):`;
  const enc = encodeURIComponent(prompt);
  const apis = [
    // API 1: Pollinations text GET
    async () => {
      const r = await axios.get(`https://text.pollinations.ai/${enc}?seed=${Date.now() % 9999}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      const a = typeof r.data === 'string' ? r.data.trim() : null;
      if (a && a.length > 3 && !a.startsWith('{')) return a;
      throw new Error('pollinations: no text');
    },
    // API 2: Pollinations POST
    async () => {
      const r = await axios.post('https://text.pollinations.ai/', {
        messages: [
          { role: 'system', content: characterPrompt },
          { role: 'user', content: userMessage + '\n\nRespond in character (2-4 sentences max).' },
        ],
        model: 'openai-fast',
        seed: Math.floor(Math.random() * 9999),
      }, { timeout: 25000, headers: { 'User-Agent': UA, 'Content-Type': 'application/json' } });
      const a = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
      if (a && a.length > 3) return a;
      throw new Error('pollinations POST: no data');
    },
    // API 3: GiftedTech web.id
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/ai/gpt4o?apikey=gifted&q=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const a = r.data?.result || r.data?.message;
      if (a) return a;
      throw new Error('giftedtech: no data');
    },
    // API 4: PopCat
    async () => {
      const r = await axios.get(`https://api.popcat.xyz/chatbot?msg=${enc}&uid=novaspark`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const a = r.data?.response;
      if (a) return a;
      throw new Error('popcat: no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('Character AI unavailable.');
}

module.exports = {
  name: 'character',
  aliases: ['char', 'roleplay', 'rp', 'act'],
  category: 'ai',
  description: 'Chat with an AI character (luffy, naruto, goku, tony, sherlock, batman)',
  usage: '.character <name> <message>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const charName = (args[0] || '').toLowerCase();
    const message  = args.slice(1).join(' ');

    if (!charName) {
      const list = Object.keys(PRESETS).join(', ');
      return reply(`🎭 *Character AI*\n\nAvailable characters:\n${list}\n\n_Usage: .character naruto believe it!_`);
    }

    const preset = PRESETS[charName];
    if (!preset) {
      const list = Object.keys(PRESETS).join(', ');
      return reply(`❌ Unknown character: *${charName}*\n\nAvailable: ${list}`);
    }

    if (!message) return reply(`💬 What do you want to say to *${charName}*?\n\n_Example: .character luffy are you hungry?_`);

    try {
      await sock.sendMessage(from, { react: { text: '🎭', key: msg.key } });
      const answer = await chatAsCharacter(preset, message);
      await reply(`🎭 *${charName.charAt(0).toUpperCase() + charName.slice(1)}:*\n\n${answer}`);
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
