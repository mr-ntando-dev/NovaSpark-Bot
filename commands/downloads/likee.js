/**
 * ⚡ NovaSpark Bot v10 — Likee Video Downloader
 * Download videos from Likee
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadLikee(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/likee?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/likee?apikey=gifted&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('Likee download failed.');
}

module.exports = {
  name: 'likee',
  aliases: ['likeedl'],
  category: 'downloads',
  description: 'Download Likee videos',
  usage: '.likee <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.includes('likee')) {
      return reply('🎥 *Likee Downloader*\n\n_Example: `.likee https://likee.video/...`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🎥', key: msg.key } });
      const result = await downloadLikee(url);
      const videoUrl = result.url || result.video || result.download;
      if (!videoUrl) return reply('❌ No video found.');

      const _tmpLK = require('path').join(require('os').tmpdir(), 'ns_lk_' + Date.now() + '.mp4');
      const video = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      require('fs').writeFileSync(_tmpLK, Buffer.from(video.data));
      await sock.sendMessage(from, { video: { url: _tmpLK }, caption: `🎥 ${result.title || 'Likee Video'}\n\n_NovaSpark Bot ⚡_`, mimetype: 'video/mp4' }, { quoted: msg });
      require('fs').unlink(_tmpLK, () => {});
    } catch (e) {
      await reply(`❌ Likee Error: ${e.message}`);
    }
  },
};
