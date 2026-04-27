/**
 * ⚡ NovaSpark Bot v5 — GPT / AI Chat
 * ChatGPT-style responses via public AI APIs
 * Multi-API fallback — no key needed
 * Ported & expanded from KnightBot-Mini + Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function askGPT(query) {
  const enc = encodeURIComponent(query);
  const apis = [
    // API 1: Pollinations text (free, no key, reliable)
    async () => {
      const r = await axios.get(`https://text.pollinations.ai/${enc}?seed=${Date.now() % 9999}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      const ans = typeof r.data === 'string' ? r.data.trim() : null;
      if (ans && ans.length > 3 && !ans.startsWith('{')) return ans;
      throw new Error('pollinations: no text');
    },
    // API 2: Pollinations POST (OpenAI-compatible, free)
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
    // API 3: GiftedTech web.id (different domain, may be up)
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/ai/gpt4o?apikey=gifted&q=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const ans = r.data?.result || r.data?.message || r.data?.answer;
      if (ans) return ans;
      throw new Error('giftedtech web.id: no data');
    },
    // API 4: PopCat (no key needed)
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
  throw new Error('All AI APIs are unavailable right now. Try again later.');
}

module.exports = {
  name: 'gpt',
  aliases: ['ai', 'chatgpt', 'askgpt', 'ask', 'nova'],
  category: 'ai',
  description: 'Chat with AI (GPT-style)',
  usage: '.gpt <question>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const query = args.join(' ');
    if (!query) return reply('🤖 Ask me anything!\n\n_Example: .gpt What is the capital of Zimbabwe?_');

    try {
      await sock.sendMessage(from, { react: { text: '🤖', key: msg.key } });
      const answer = await askGPT(query);
      await reply(`🤖 *NovaSpark AI*\n\n${answer}`);
    } catch (e) {
      await reply(`❌ AI Error: ${e.message}`);
    }
  },
};
