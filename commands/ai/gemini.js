/**
 * ⚡ NovaSpark Bot v5 — Gemini AI
 * Google Gemini-powered responses — multi-API fallback
 * Ported & adapted from Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function askGemini(query) {
  const apis = [
    `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
    `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
    `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
    `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
    `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`,
    `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
  ];

  for (const url of apis) {
    try {
      const r = await axios.get(url, { timeout: 20000, headers: { 'User-Agent': UA } });
      const d = r.data;
      const ans = d?.message || d?.data || d?.answer || d?.result || d?.response;
      if (ans && typeof ans === 'string' && ans.length > 3) return ans;
    } catch {}
  }
  throw new Error('All Gemini APIs failed. Try again later.');
}

module.exports = {
  name: 'gemini',
  aliases: ['gem', 'google', 'bard'],
  category: 'ai',
  description: 'Ask Google Gemini AI',
  usage: '.gemini <question>',

  async execute(sock, msg, args, extra) {
    const query = args.join(' ');
    if (!query) return extra.reply('🧠 Ask Gemini anything!\n\n_Example: .gemini Explain quantum physics simply_');

    try {
      await sock.sendMessage(extra.from, { react: { text: '🧠', key: msg.key } });
      const answer = await askGemini(query);
      await extra.reply(`🧠 *Gemini AI*\n\n${answer}`);
    } catch (e) {
      await extra.reply(`❌ Gemini Error: ${e.message}`);
    }
  },
};
