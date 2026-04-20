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
  const apis = [
    async () => {
      const r = await axios.get(`https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const ans = r.data?.result || r.data?.response || r.data?.msg;
      if (ans) return ans;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(query)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const ans = r.data?.data || r.data?.result || r.data?.message;
      if (ans) return ans;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const ans = r.data?.result || r.data?.message || r.data?.answer;
      if (ans) return ans;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const ans = r.data?.result || r.data?.message || r.data?.data;
      if (ans) return ans;
      throw new Error('no data');
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
