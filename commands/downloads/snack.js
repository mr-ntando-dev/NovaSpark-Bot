/**
 * ⚡ NovaSpark Bot v10 — Snack Video Downloader
 * Download videos from Snack Video
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadSnack(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/snackvideo?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/snackvideo?apikey=gifted&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('Snack Video download failed.');
}

module.exports = {
  name: 'snack',
  aliases: ['snackvideo', 'snackdl'],
  category: 'downloads',
  description: 'Download Snack Video clips',
  usage: '.snack <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.includes('snack')) {
      return reply('🎬 *Snack Video Downloader*\n\n_Example: `.snack https://share.snackvideo.com/...`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } });
      const result = await downloadSnack(url);
      const videoUrl = result.url || result.video || result.download;
      if (!videoUrl) return reply('❌ No video found.');

      const video = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      await sock.sendMessage(from, { video: Buffer.from(video.data), caption: `🎬 ${result.title || 'Snack Video'}\n\n_NovaSpark Bot ⚡_`, mimetype: 'video/mp4' }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Snack Error: ${e.message}`);
    }
  },
};
