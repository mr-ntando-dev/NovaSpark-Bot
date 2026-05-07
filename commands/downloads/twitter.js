/**
 * ⚡ NovaSpark Bot v10 — Twitter/X Video Downloader
 * Download videos, GIFs, and images from Twitter/X posts
 * Multi-API cascade
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PATTERNS = [
  /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/\w+\/status\/\d+/,
  /https?:\/\/t\.co\//,
];

async function downloadTwitter(url) {
  const enc = encodeURIComponent(url);

  const apis = [
    // API 1: Siputzx Twitter
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/twitter?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data?.media?.[0]) {
        const media = r.data.data.media[0];
        return { url: media.url || media.video, type: media.type || 'video', title: r.data.data.text?.substring(0, 100) || 'Twitter Video' };
      }
      throw new Error('no data');
    },
    // API 2: SaveTwitter
    async () => {
      const r = await axios.get(`https://api.savetwitter.net/api/v1/twitter?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.data?.url || r.data?.data?.[0]?.url) {
        const d = r.data.data;
        const mediaUrl = d.url || d[0]?.url;
        return { url: mediaUrl, type: 'video', title: r.data.data.title || 'Twitter Video' };
      }
      throw new Error('no data');
    },
    // API 3: TwtDown
    async () => {
      const r = await axios.post('https://twtdown.com/api/download', { url }, { timeout: 20000, headers: { 'User-Agent': UA, 'Content-Type': 'application/json' } });
      if (r.data?.url || r.data?.video) {
        return { url: r.data.url || r.data.video, type: 'video', title: 'Twitter Video' };
      }
      throw new Error('no data');
    },
    // API 4: Gifted Tech Twitter
    async () => {
      const r = await axios.get(`https://api.giftedtech.web.id/api/download/twitter?apikey=gifted&url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      const d = r.data?.result || r.data?.data;
      if (d?.url || d?.video) return { url: d.url || d.video, type: 'video', title: d.title || 'Twitter Video' };
      throw new Error('no data');
    },
  ];

  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('Twitter download failed. The tweet may be private or deleted.');
}

module.exports = {
  name: 'twitter',
  aliases: ['x', 'xdl', 'twitterdl', 'tweet'],
  category: 'downloads',
  description: 'Download videos/GIFs from Twitter/X',
  usage: '.twitter <tweet URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || !PATTERNS.some(p => p.test(url))) {
      return reply('🐦 *Twitter/X Downloader*\n\nSend a tweet URL to download videos or GIFs.\n\n_Example: `.twitter https://x.com/user/status/123456`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🐦', key: msg.key } });
      const result = await downloadTwitter(url);

      const _tmpTW = require('path').join(require('os').tmpdir(), 'ns_tw_' + Date.now() + '.mp4');
      const mediaBuffer = await axios.get(result.url, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      require('fs').writeFileSync(_tmpTW, Buffer.from(mediaBuffer.data));

      await sock.sendMessage(from, {
        video: { url: _tmpTW },
        caption: `🐦 *Twitter/X Download*\n\n${result.title || ''}\n\n_NovaSpark Bot ⚡_`,
        mimetype: 'video/mp4',
      }, { quoted: msg });
      require('fs').unlink(_tmpTW, () => {});
    } catch (e) {
      await reply(`❌ Twitter Error: ${e.message}`);
    }
  },
};
