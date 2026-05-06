/**
 * ⚡ NovaSpark Bot v5 — Meme
 * Fetch a random meme from Reddit via meme API
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'meme',
  aliases: ['randommeme', 'funnypic'],
  category: 'fun',
  description: 'Random meme from the internet',
  usage: '.meme',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      await reply('😂 Fetching a meme...');
      const { data } = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });

      if (!data?.url) return reply('❌ Could not fetch a meme right now. Try again!');

      await sock.sendMessage(from, {
        image:   { url: data.url },
        caption: `😂 *${data.title}*\n\n_r/${data.subreddit} — 👍 ${data.ups}_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Meme API error: ${e.message}`);
    }
  },
};
