/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .waifu — Send a random anime waifu image
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'waifu',
  aliases: ['animegirl', 'neko'],
  description: 'Get a random anime waifu image',
  category: 'fun',

  execute: async ({ sock, msg, from, reply }) => {
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 10000 });
      const url = data?.url;
      if (!url) throw new Error('no url');
      await sock.sendMessage(from, { image: { url }, caption: `🌸 *Random Waifu* ✨\n_⚡ NovaSpark Bot — Dev-Ntando_` }, { quoted: msg });
    } catch {
      return reply('❌ Could not fetch a waifu image right now. Try again!');
    }
  },
};
