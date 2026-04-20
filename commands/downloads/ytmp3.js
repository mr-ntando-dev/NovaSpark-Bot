/**
 * ⚡ NovaSpark Bot v5 — YouTube MP3 / Song Downloader
 * Search by name OR paste a YouTube URL — sends audio
 * Multi-API fallback: EliteProTech → Yupra → Okatsu
 * Ported & adapted from Knightbot-MD | By Dev-Ntando
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
      const r = await axios.get(`https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp3`, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data?.success && r.data?.downloadURL) return { download: r.data.downloadURL, title: r.data.title };
      throw new Error('EliteProTech no data');
    },
    async () => {
      const r = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data?.success && r.data?.data?.download_url) return { download: r.data.data.download_url, title: r.data.data.title, thumb: r.data.data.thumbnail };
      throw new Error('Yupra no data');
    },
    async () => {
      const r = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data?.dl) return { download: r.data.dl, title: r.data.title, thumb: r.data.thumb };
      throw new Error('Okatsu no data');
    },
  ];
  for (const fn of apis) {
    try { return await fn(); } catch {}
  }
  throw new Error('All audio APIs failed');
}

module.exports = {
  name: 'ytmp3',
  aliases: ['song', 'play', 'mp3', 'audio', 'ytaudio'],
  category: 'downloads',
  description: 'Download YouTube audio (MP3)',
  usage: '.song <name or YouTube URL>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const query = args.join(' ');
    if (!query) return reply('🎵 Provide a song name or YouTube URL!\n\n_Example: .song Blinding Lights_');

    try {
      await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } });

      let videoUrl, videoTitle, videoThumb, videoDuration;

      if (/youtu\.?be/.test(query)) {
        videoUrl = query;
        videoTitle = 'Song';
      } else {
        const { videos } = await yts(query);
        if (!videos?.length) return reply('❌ No results found for that song.');
        const v     = videos[0];
        videoUrl    = v.url;
        videoTitle  = v.title;
        videoThumb  = v.thumbnail;
        videoDuration = v.timestamp;
      }

      // Send thumbnail card
      if (videoThumb) {
        await sock.sendMessage(from, {
          image: { url: videoThumb },
          caption: `🎵 *${videoTitle}*\n⏱ ${videoDuration || ''}\n\n⬇️ Downloading audio...`,
        }, { quoted: msg });
      } else {
        await reply(`🎵 Downloading *${videoTitle}*...`);
      }

      const data = await tryApis(videoUrl);

      // Download audio buffer
      const tmpFile = path.join(os.tmpdir(), `ns_audio_${Date.now()}.mp3`);
      const dlRes   = await axios.get(data.download, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));

      await sock.sendMessage(from, {
        audio:    fs.readFileSync(tmpFile),
        mimetype: 'audio/mp4',
        fileName: `${(data.title || videoTitle || 'song').replace(/[^\w\s-]/g, '')}.mp3`,
        ptt:      false,
      }, { quoted: msg });

      fs.unlink(tmpFile, () => {});
    } catch (e) {
      await reply(`❌ Download failed: ${e.message}`);
    }
  },
};
