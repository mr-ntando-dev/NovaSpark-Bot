/**
 * ⚡ NovaSpark Bot v5 — YouTube Video Downloader
 * .video / .ytvideo — search by name OR paste any YouTube URL (shorts, live, music)
 * Multi-API fallback + rich animated download status
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const yts   = require('yt-search');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function normalizeYtUrl(raw) {
  try {
    const u = new URL(raw.trim());
    if (u.hostname === 'youtu.be') return 'https://www.youtube.com/watch?v=' + u.pathname.slice(1);
    if (u.pathname.startsWith('/shorts/')) return 'https://www.youtube.com/watch?v=' + u.pathname.split('/')[2];
    if (u.pathname.startsWith('/live/')) return 'https://www.youtube.com/watch?v=' + u.pathname.split('/')[2];
    if (u.hostname.includes('music.youtube')) {
      const v = u.searchParams.get('v');
      if (v) return 'https://www.youtube.com/watch?v=' + v;
    }
    return raw.trim();
  } catch { return raw.trim(); }
}

function progressBar(pct, len) {
  len = len || 14;
  const filled = Math.round(pct / 100 * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

async function tryApis(youtubeUrl) {
  const encoded = encodeURIComponent(youtubeUrl);
  const apis = [
    async () => {
      const r = await axios.get('https://ytdl.vreden.web.id/api/v1/dl?url=' + encoded + '&format=mp4', { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.download && r.data.result.download.url)
        return { download: r.data.result.download.url, title: r.data.result.title, thumb: r.data.result.thumbnail, duration: r.data.result.duration };
      throw new Error('vreden no data');
    },
    async () => {
      const r = await axios.get('https://eliteprotech-apis.zone.id/ytdown?url=' + encoded + '&format=mp4', { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.downloadURL)
        return { download: r.data.downloadURL, title: r.data.title, thumb: r.data.thumbnail };
      throw new Error('EliteProTech no data');
    },
    async () => {
      const r = await axios.get('https://api.yupra.my.id/api/downloader/ytmp4?url=' + encoded, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.data && r.data.data.download_url)
        return { download: r.data.data.download_url, title: r.data.data.title, thumb: r.data.data.thumbnail, duration: r.data.data.duration };
      throw new Error('Yupra no data');
    },
    async () => {
      const r = await axios.get('https://api.nusantara-bot.biz.id/ytdl/mp4?url=' + encoded, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.dl_url)
        return { download: r.data.result.dl_url, title: r.data.result.title, thumb: r.data.result.thumbnail };
      throw new Error('Nusantara no data');
    },
    async () => {
      const r = await axios.get('https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=' + encoded, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.dl) return { download: r.data.dl, title: r.data.title, thumb: r.data.thumb };
      throw new Error('Okatsu no data');
    },
  ];
  const errors = [];
  for (const fn of apis) {
    try { return await fn(); } catch (e) { errors.push(e.message); }
  }
  throw new Error('All video APIs failed — ' + errors.join(' | '));
}

module.exports = {
  name: 'ytmp4',
  aliases: ['video', 'ytvideo', 'ytv', 'yvid', 'mp4'],
  category: 'downloads',
  description: 'Download YouTube video — search by name or paste any YouTube URL',
  usage: '.video <name or YouTube URL>',

  async execute({ sock, msg, from, args, reply }) {
    const query = args.join(' ').trim();
    if (!query) return reply(
      '🎬 *NovaSpark Downloader*\n\n' +
      'Usage:\n' +
      '• .video Bohemian Rhapsody\n' +
      '• .video https://youtu.be/xxxxx\n' +
      '• .video https://www.youtube.com/shorts/xxxxx'
    );

    await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } });

    let videoUrl, videoTitle, videoThumb, videoDuration;

    try {
      if (/youtu\.?be|youtube\.com/i.test(query)) {
        videoUrl   = normalizeYtUrl(query);
        videoTitle = 'Resolving...';
      } else {
        await sock.sendMessage(from, {
          text:
            '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
            '  🎬 *NovaSpark Downloader*\n' +
            '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
            '🔍 Searching: _' + query + '_\n' +
            progressBar(15) + ' 15%\n\n' +
            '_⚡ Please wait..._',
        }, { quoted: msg });

        const { videos } = await yts(query);
        if (!videos || !videos.length) return reply('❌ No results found. Try different words.');
        const v       = videos[0];
        videoUrl      = v.url;
        videoTitle    = v.title;
        videoThumb    = v.thumbnail;
        videoDuration = v.timestamp;
      }

      if (videoThumb) {
        await sock.sendMessage(from, {
          image: { url: videoThumb },
          caption:
            '🎬 *' + videoTitle + '*\n' +
            '⏱ ' + (videoDuration || '') + '\n\n' +
            '╔══════════════════════╗\n' +
            '  ⬇️  *DOWNLOADING VIDEO*  \n' +
            '  ' + progressBar(40) + ' 40%\n' +
            '╚══════════════════════╝\n\n' +
            '_🔄 Fetching from servers..._',
        }, { quoted: msg });
      }

      const data = await tryApis(videoUrl);
      const resolvedTitle = (data.title || videoTitle || 'Video').replace(/[^\w\s\-–]/g, '').trim();

      if (!videoThumb && data.thumb) {
        await sock.sendMessage(from, {
          image: { url: data.thumb },
          caption:
            '🎬 *' + resolvedTitle + '*\n\n' +
            '╔══════════════════════╗\n' +
            '  ⬇️  *DOWNLOADING VIDEO*  \n' +
            '  ' + progressBar(60) + ' 60%\n' +
            '╚══════════════════════╝\n\n' +
            '_🔄 Almost there..._',
        }, { quoted: msg });
      }

      const tmpFile = path.join(os.tmpdir(), 'ns_video_' + Date.now() + '.mp4');
      const dlRes   = await axios.get(data.download, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': UA } });
      fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));

      const sizeMB = (fs.statSync(tmpFile).size / 1024 / 1024).toFixed(1);
      if (parseFloat(sizeMB) > 64) {
        fs.unlink(tmpFile, () => {});
        return reply('❌ Video too large (' + sizeMB + 'MB). WhatsApp limit is 64MB.\n\n_Try .song to get audio only._');
      }

      const videoBuffer = fs.readFileSync(tmpFile);
      const dur = videoDuration || data.duration || '—';

      const caption =
        '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
        '  🎬 *NovaSpark Video*\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
        '🎞  *' + resolvedTitle + '*\n' +
        '⏱  Duration : ' + dur + '\n' +
        '💾  Size     : ' + sizeMB + ' MB\n' +
        progressBar(100) + ' ✅\n\n' +
        '_⚡ Powered by NovaSpark Bot_';

      // 1️⃣ Send as playable video with rich caption
      await sock.sendMessage(from, {
        video:    videoBuffer,
        mimetype: 'video/mp4',
        fileName: resolvedTitle + '.mp4',
        caption:  caption,
      }, { quoted: msg });

      // 2️⃣ Send as document so users can save the full mp4 file directly
      await sock.sendMessage(from, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: resolvedTitle + '.mp4',
        caption:  '📎 *' + resolvedTitle + '.mp4* — tap to save',
      }, { quoted: msg });

      fs.unlink(tmpFile, () => {});
    } catch (e) {
      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  ❌ *Download Failed*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          '• Query: _' + query + '_\n' +
          '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
          '_💡 Tip: Try searching by video name instead of URL_',
      }, { quoted: msg });
    }
  },
};
