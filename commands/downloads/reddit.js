/**
 * ⚡ NovaSpark Bot v10 — Reddit Video/Image Downloader
 * Download media from Reddit posts
 * By Dev-Ntando
 */
'use strict';

const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadReddit(url) {
  const enc = encodeURIComponent(url);
  const apis = [
    async () => {
      const r = await axios.get(`https://api.siputzx.my.id/api/d/reddit?url=${enc}`, { timeout: 20000, headers: { 'User-Agent': UA } });
      if (r.data?.status && r.data?.data) return r.data.data;
      throw new Error('no data');
    },
    // Reddit JSON API fallback
    async () => {
      const jsonUrl = url.replace(/\/$/, '') + '.json';
      const r = await axios.get(jsonUrl, { timeout: 15000, headers: { 'User-Agent': UA } });
      const post = r.data?.[0]?.data?.children?.[0]?.data;
      if (!post) throw new Error('no post');
      const mediaUrl = post.secure_media?.reddit_video?.fallback_url || post.url_overridden_by_dest || post.url;
      return { url: mediaUrl, title: post.title, subreddit: post.subreddit_name_prefixed };
    },
  ];
  for (const fn of apis) { try { return await fn(); } catch {} }
  throw new Error('Reddit download failed.');
}

module.exports = {
  name: 'reddit',
  aliases: ['redditdl', 'redditsave'],
  category: 'downloads',
  description: 'Download videos/images from Reddit',
  usage: '.reddit <URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = args[0];
    if (!url || (!url.includes('reddit.com') && !url.includes('redd.it'))) {
      return reply('🤖 *Reddit Downloader*\n\n_Example: `.reddit https://www.reddit.com/r/funny/comments/...`_');
    }

    try {
      await sock.sendMessage(from, { react: { text: '🤖', key: msg.key } });
      const result = await downloadReddit(url);

      const mediaUrl = result.url || result.video || result.image;
      const title = result.title || 'Reddit Post';

      if (!mediaUrl) return reply('❌ No media found in that Reddit post.');

      const media = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('v.redd.it') || mediaUrl.includes('video');

      if (isVideo) {
        const _tmpRD = require('path').join(require('os').tmpdir(), 'ns_rd_' + Date.now() + '.mp4');
        require('fs').writeFileSync(_tmpRD, Buffer.from(media.data));
        await sock.sendMessage(from, { video: { url: _tmpRD }, caption: `🤖 *${title}*\n\n_NovaSpark Bot ⚡_`, mimetype: 'video/mp4' }, { quoted: msg });
        require('fs').unlink(_tmpRD, () => {});
      } else {
        await sock.sendMessage(from, { image: { url: mediaUrl }, caption: `🤖 *${title}*\n\n_NovaSpark Bot ⚡_` }, { quoted: msg });
      }
    } catch (e) {
      await reply(`❌ Reddit Error: ${e.message}`);
    }
  },
};
