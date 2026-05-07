/**
 * ⚡ NovaSpark Bot v10 — Threads Downloader
 * Download videos/images from Meta Threads
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadThreads(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/threads?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/threads?apikey=gifted&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('Threads download failed.');
}

module.exports = {
  name: 'threads',
  aliases: ['threadsdl', 'thread'],
  category: 'downloads',
  description: 'Download videos/images from Threads',
  usage: '.threads <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.includes('threads.net')) {
      return reply('🧵 *Threads Downloader*\n\n_Example: `.threads https://www.threads.net/@user/post/abc123`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🧵', key: msg.key } });
      const result = await downloadThreads(url);

      const mediaUrl = result.url || result.video || result.image || (Array.isArray(result) ? result[0]?.url : null);
      if (!mediaUrl) return reply('❌ No media found in that Threads post.');

      const media = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');

      if (isVideo) {
        const _tmpTH = require('path').join(require('os').tmpdir(), 'ns_th_' + Date.now() + '.mp4');
        require('fs').writeFileSync(_tmpTH, Buffer.from(media.data));
        await sock.sendMessage(from, { video: { url: _tmpTH }, caption: '🧵 _NovaSpark Bot ⚡_', mimetype: 'video/mp4' }, { quoted: msg });
        require('fs').unlink(_tmpTH, () => {});
      } else {
        await sock.sendMessage(from, { image: { url: mediaUrl }, caption: '🧵 _NovaSpark Bot ⚡_' }, { quoted: msg });
      }
    } catch (e) {
      await reply(`❌ Threads Error: ${e.message}`);
    }
  },
};
