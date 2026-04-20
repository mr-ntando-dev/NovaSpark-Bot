/**
 * ⚡ NovaSpark Bot v5 — Pinterest Downloader
 * Images & Videos from Pinterest pins
 * API: Siputzx → Pinterestdl fallback
 * Ported & adapted from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const PIN_PATTERNS = [
  /https?:\/\/(?:www\.)?pinterest\.com\//,
  /https?:\/\/pin\.it\//,
  /https?:\/\/(?:www\.)?pinterest\.[a-z]+\//,
];

async function downloadPin(url) {
  // API 1 — Siputzx
  try {
    const r = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && d.data) return { url: d.data.url || d.data.video || d.data.image, type: d.data.video ? 'video' : 'image', title: d.data.title };
  } catch {}

  // API 2 — Yupra
  try {
    const r = await axios.get(`https://api.yupra.my.id/api/downloader/pinterest?url=${encodeURIComponent(url)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.success && d.data) return { url: d.data.url, type: d.data.type || 'image', title: d.data.title };
  } catch {}

  throw new Error('Pinterest API failed — pin may be private or unavailable.');
}

module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pindl', 'pint'],
  category: 'downloads',
  description: 'Download Pinterest images/videos',
  usage: '.pin <Pinterest URL>',

  async execute(sock, msg, args, extra) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return extra.reply('📌 Provide a Pinterest URL!\n\n_Example: .pin https://pin.it/xxx_');
    if (!PIN_PATTERNS.some(p => p.test(url))) return extra.reply('❌ That does not look like a Pinterest link.');

    try {
      await sock.sendMessage(extra.from, { react: { text: '📌', key: msg.key } });

      const data = await downloadPin(url);

      if (data.type === 'video') {
        await sock.sendMessage(extra.from, {
          video:   { url: data.url },
          mimetype: 'video/mp4',
          caption: `📌 Pinterest Video\n_⚡ NovaSpark Bot_`,
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          image:   { url: data.url },
          caption: `📌 Pinterest Image\n_⚡ NovaSpark Bot_`,
        }, { quoted: msg });
      }
    } catch (e) {
      await extra.reply(`❌ Failed: ${e.message}`);
    }
  },
};
