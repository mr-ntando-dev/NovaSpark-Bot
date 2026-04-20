/**
 * ⚡ NovaSpark Bot v5 — YouTube MP4 / Video Downloader
 * Search by name OR paste a YouTube URL — sends video
 * Multi-API fallback: EliteProTech → Yupra → Okatsu
 * Ported & adapted from KnightBot-Mini + Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const yts   = require('yt-search');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function tryApis(youtubeUrl) {
  const apis = [
    async () => {
      const r = await axios.get(`https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp4`, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data?.success && r.data?.downloadURL) return { download: r.data.downloadURL, title: r.data.title };
      throw new Error('EliteProTech no data');
    },
    async () => {
      const r = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data?.success && r.data?.data?.download_url) return { download: r.data.data.download_url, title: r.data.data.title, thumb: r.data.data.thumbnail };
      throw new Error('Yupra no data');
    },
    async () => {
      const r = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data?.dl) return { download: r.data.dl, title: r.data.title, thumb: r.data.thumb };
      throw new Error('Okatsu no data');
    },
  ];
  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('All video APIs failed');
}

module.exports = {
  name: 'ytmp4',
  aliases: ['ytvideo', 'video', 'ytv', 'yvid', 'mp4'],
  category: 'downloads',
  description: 'Download YouTube video (MP4)',
  usage: '.video <name or YouTube URL>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const query = args.join(' ');
    if (!query) return reply('🎬 Provide a video name or YouTube URL!\n\n_Example: .video Bohemian Rhapsody_');

    try {
      await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } });

      let videoUrl, videoTitle, videoThumb, videoDuration;

      if (/youtu\.?be/.test(query)) {
        videoUrl = query;
        videoTitle = 'Video';
      } else {
        const { videos } = await yts(query);
        if (!videos?.length) return reply('❌ No videos found.');
        const v     = videos[0];
        videoUrl    = v.url;
        videoTitle  = v.title;
        videoThumb  = v.thumbnail;
        videoDuration = v.timestamp;
      }

      if (videoThumb) {
        await sock.sendMessage(from, {
          image: { url: videoThumb },
          caption: `🎬 *${videoTitle}*\n⏱ ${videoDuration || ''}\n\n⬇️ Downloading video...`,
        }, { quoted: msg });
      } else {
        await reply(`🎬 Downloading *${videoTitle}*...`);
      }

      const data   = await tryApis(videoUrl);
      const tmpFile = path.join(os.tmpdir(), `ns_video_${Date.now()}.mp4`);
      const dlRes  = await axios.get(data.download, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': UA } });
      fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));

      const fileSizeMB = fs.statSync(tmpFile).size / 1024 / 1024;
      if (fileSizeMB > 64) {
        fs.unlink(tmpFile, () => {});
        return reply(`❌ Video too large (${fileSizeMB.toFixed(1)}MB) — WhatsApp limit is 64MB.`);
      }

      await sock.sendMessage(from, {
        video:    fs.readFileSync(tmpFile),
        mimetype: 'video/mp4',
        fileName: `${(data.title || videoTitle || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
        caption:  `🎬 *${data.title || videoTitle}*\n\n_⚡ NovaSpark Bot_`,
      }, { quoted: msg });

      fs.unlink(tmpFile, () => {});
    } catch (e) {
      await reply(`❌ Download failed: ${e.message}`);
    }
  },
};
