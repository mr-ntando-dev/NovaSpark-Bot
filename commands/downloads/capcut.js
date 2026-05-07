/**
 * ⚡ NovaSpark Bot v10 — CapCut Video Downloader
 * Download CapCut template videos
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadCapCut(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/capcut?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/capcut?apikey=gifted&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.result) return r.data.result;
      throw new Error('no data');
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('CapCut download failed.');
}

module.exports = {
  name: 'capcut',
  aliases: ['capcutdl', 'cc'],
  category: 'downloads',
  description: 'Download CapCut template videos',
  usage: '.capcut <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !url.includes('capcut')) {
      return reply('🎬 *CapCut Downloader*\n\n_Example: `.capcut https://www.capcut.com/t/...`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } });
      const result = await downloadCapCut(url);
      const videoUrl = result.url || result.video || result.download;
      const title = result.title || 'CapCut Video';
      if (!videoUrl) return reply('❌ No video found.');

      const _tmpCC = require('path').join(require('os').tmpdir(), 'ns_cc_' + Date.now() + '.mp4');
      const video = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      require('fs').writeFileSync(_tmpCC, Buffer.from(video.data));
      await sock.sendMessage(from, { video: { url: _tmpCC }, caption: `🎬 *${title}*\n\n_NovaSpark Bot ⚡_`, mimetype: 'video/mp4' }, { quoted: msg });
      require('fs').unlink(_tmpCC, () => {});
    } catch (e) {
      await reply(`❌ CapCut Error: ${e.message}`);
    }
  },
};
