/**
 * ⚡ NovaSpark Bot v5 — Gemini AI
 * Google Gemini-powered responses — multi-API fallback
 * Ported & adapted from Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function askGemini(query) {
  const enc = encodeURIComponent(query);
  const apis = [
    // API 1: Pollinations text GET (free, no key, confirmed working)
    async () => {
      const r = await axios.get(`https://text.pollinations.ai/${enc}?seed=${Date.now() % 9999}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      const ans = typeof r.data === 'string' ? r.data.trim() : null;
      if (ans && ans.length > 3 && !ans.startsWith('{')) return ans;
      throw new Error('pollinations: no text');
    },
    // API 2: Pollinations POST (OpenAI-compatible)
    async () => {
      const r = await axios.post('https://text.pollinations.ai/', {
        messages: [{ role: 'user', content: query }],
        model: 'openai-fast',
        seed: Math.floor(Math.random() * 9999),
      }, { timeout: 25000, headers: { 'User-Agent': UA, 'Content-Type': 'application/json' } });
      const ans = typeof r.data === 'string' ? r.data.trim() : r.data?.choices?.[0]?.message?.content;
      if (ans && ans.length > 3) return ans;
      throw new Error('pollinations POST: no data');
    },
    // API 3: GiftedTech web.id
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/ai/gpt4o?apikey=gifted&q=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const ans = r.data?.result || r.data?.message || r.data?.answer;
      if (ans) return ans;
      throw new Error('giftedtech: no data');
    },
    // API 4: PopCat chatbot
    async () => {
      const r = await axios.get(`https://api.popcat.xyz/chatbot?msg=${enc}&uid=novaspark`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const ans = r.data?.response;
      if (ans) return ans;
      throw new Error('popcat: no data');
    },
  ];
  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('All Gemini APIs failed. Try again later.');
}

module.exports = {
  name: 'gemini',
  aliases: ['gem', 'google', 'bard'],
  category: 'ai',
  description: 'Ask Google Gemini AI',
  usage: '.gemini <question>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const query = args.join(' ');
    if (!query) return reply('🧠 Ask Gemini anything!\n\n_Example: .gemini Explain quantum physics simply_');

    try {
      await sock.sendMessage(from, { react: { text: '🧠', key: msg.key } });
      const answer = await askGemini(query);
      await reply(`🧠 *Gemini AI*\n\n${answer}`);
    } catch (e) {
      await reply(`❌ Gemini Error: ${e.message}`);
    }
  },
};
