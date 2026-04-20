/**
 * ⚡ NovaSpark Bot v5 — Screenshot Website (SSWeb)
 * Takes a screenshot of any URL and sends it as an image
 * Uses screenshotmachine API (free tier, no key needed)
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'ssweb',
  aliases: ['screenshot', 'ss', 'webss', 'webshot'],
  category: 'general',
  description: 'Take a screenshot of a website',
  usage: '.ss <URL>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const url = args[0];
    if (!url) return reply('🌐 Provide a website URL!\n\n_Example: .ss https://google.com_');
    if (!url.startsWith('http')) return reply('❌ URL must start with http:// or https://');

    try {
      await reply(`📸 Taking screenshot of *${url}*...`);

      // screenshotmachine — no key needed for basic shots
      const ssUrl = `https://api.screenshotmachine.com/?url=${encodeURIComponent(url)}&dimension=1280x720&format=png&timeout=5000`;

      const res = await axios.get(ssUrl, { responseType: 'arraybuffer', timeout: 30000 });

      if (!res.data || res.data.byteLength < 1000) {
        // fallback: thum.io
        const fallback = `https://image.thum.io/get/width/1280/crop/720/${encodeURIComponent(url)}`;
        const r2 = await axios.get(fallback, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(from, {
          image:   Buffer.from(r2.data),
          caption: `📸 Screenshot: *${url}*\n_⚡ NovaSpark Bot_`,
        }, { quoted: msg });
        return;
      }

      await sock.sendMessage(from, {
        image:   Buffer.from(res.data),
        caption: `📸 Screenshot: *${url}*\n_⚡ NovaSpark Bot_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Screenshot failed: ${e.message}`);
    }
  },
};
