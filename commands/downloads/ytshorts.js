/**
 * ⚡ NovaSpark Bot v10 — YouTube Shorts Downloader
 * Fast download for YouTube Shorts specifically
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadShorts(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/ytshorts?url=${enc}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${enc}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/ytshorts?apikey=gifted&url=${enc}`, { timeout: 25000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('YouTube Shorts download failed.');
}

module.exports = {
  name: 'ytshorts',
  aliases: ['shorts', 'yts'],
  category: 'downloads',
  description: 'Download YouTube Shorts videos',
  usage: '.ytshorts <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || (!url.includes('youtube.com/shorts') && !url.includes('youtu.be'))) {
      return reply('🎬 *YouTube Shorts Downloader*\n\n_Example: `.ytshorts https://youtube.com/shorts/abc123`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } });
      const result = await downloadShorts(url);

      const videoUrl = result.url || result.video || result.download;
      const title = result.title || 'YouTube Short';
      if (!videoUrl) return reply('❌ Could not get video URL.');

      const _tmpYS = require('path').join(require('os').tmpdir(), 'ns_ys_' + Date.now() + '.mp4');
      const video = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      require('fs').writeFileSync(_tmpYS, Buffer.from(video.data));
      await sock.sendMessage(from, { video: { url: _tmpYS }, caption: `🎬 *${title}*\n\n_NovaSpark Bot ⚡_`, mimetype: 'video/mp4' }, { quoted: msg });
      require('fs').unlink(_tmpYS, () => {});
    } catch (e) {
      await reply(`❌ Shorts Error: ${e.message}`);
    }
  },
};
