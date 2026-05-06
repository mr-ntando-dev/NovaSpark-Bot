/**
 * ⚡ NovaSpark Bot v9 — YouTube Video Downloader
 * .video / .ytvideo — search by name OR paste any YouTube URL (shorts, live, music)
 * Multi-API fallback | Clean professional output
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

async function tryApis(youtubeUrl) {
  const encoded = encodeURIComponent(youtubeUrl);
  const apis = [
    // API 1: EliteProTech — primary, confirmed working April 2026
    async () => {
      const r = await axios.get('https://eliteprotech-apis.zone.id/ytdown?url=' + encoded + '&format=mp4', { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.downloadURL)
        return { download: r.data.downloadURL, title: r.data.title, thumb: null, duration: '--' };
      throw new Error('EliteProTech: ' + JSON.stringify(r.data).slice(0, 80));
    },
    // API 2: ymcdn direct (same backend as EliteProTech)
    async () => {
      const r = await axios.get('https://ydl.ymcdn.org/api/v1/dl?url=' + encoded + '&format=mp4', { timeout: 40000, headers: { 'User-Agent': UA, Referer: 'https://eliteprotech-apis.zone.id/' } });
      if (r.data && r.data.result && r.data.result.download && r.data.result.download.url)
        return { download: r.data.result.download.url, title: r.data.result.title, thumb: r.data.result.thumbnail || null, duration: r.data.result.duration || '--' };
      throw new Error('ymcdn: no data');
    },
    // API 3: Yupra (kept — may come back online)
    async () => {
      const r = await axios.get('https://api.yupra.my.id/api/downloader/ytmp4?url=' + encoded, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.data && r.data.data.download_url)
        return { download: r.data.data.download_url, title: r.data.data.title, thumb: r.data.data.thumbnail || null, duration: r.data.data.duration || '--' };
      throw new Error('Yupra: ' + (r.data && r.data.error ? r.data.error : 'no data'));
    },
    // API 4: vreden
    async () => {
      const r = await axios.get('https://ytdl.vreden.web.id/api/v1/dl?url=' + encoded + '&format=mp4', { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.download && r.data.result.download.url)
        return { download: r.data.result.download.url, title: r.data.result.title, thumb: r.data.result.thumbnail || null, duration: r.data.result.duration || '--' };
      throw new Error('vreden: no data');
    },
    // API 5: Nusantara
    async () => {
      const r = await axios.get('https://api.nusantara-bot.biz.id/ytdl/mp4?url=' + encoded, { timeout: 40000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.dl_url)
        return { download: r.data.result.dl_url, title: r.data.result.title, thumb: r.data.result.thumbnail || null, duration: '--' };
      throw new Error('Nusantara: no data');
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
      '🎬 *NovaSpark Video*\n\n' +
      'Usage:\n' +
      '• `.video Bohemian Rhapsody`\n' +
      '• `.video https://youtu.be/xxxxx`\n' +
      '• `.video https://www.youtube.com/shorts/xxxxx`'
    );

    await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } });

    let videoUrl, videoTitle, videoThumb, videoDuration;

    try {
      if (/youtu\.?be|youtube\.com/i.test(query)) {
        videoUrl   = normalizeYtUrl(query);
        videoTitle = 'Resolving...';
      } else {
        await sock.sendMessage(from, {
          text: '🔍 _Searching "' + query + '"..._',
        }, { quoted: msg });

        const { videos } = await yts(query);
        if (!videos || !videos.length) return reply('❌ No results found for that query.');
        const v       = videos[0];
        videoUrl      = v.url;
        videoTitle    = v.title;
        videoThumb    = v.thumbnail;
        videoDuration = v.timestamp;
      }

      const data = await tryApis(videoUrl);
      const resolvedTitle = (data.title || videoTitle || 'Video').replace(/[^\w\s\-]/g, '').trim();
      const dur   = videoDuration || data.duration || '—';

      const tmpFile = path.join(os.tmpdir(), 'ns_video_' + Date.now() + '.mp4');
      const dlRes   = await axios.get(data.download, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': UA } });
      fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));
      const sizeMB  = (fs.statSync(tmpFile).size / 1024 / 1024).toFixed(1);

      if (parseFloat(sizeMB) > 64) {
        fs.unlink(tmpFile, () => {});
        return reply('❌ Video too large (' + sizeMB + 'MB). WhatsApp limit is 64MB.\n\n_Try `.play` to get audio only._');
      }

      const videoBuf = fs.readFileSync(tmpFile);

      // ── 1. Playable video with clean caption ──────────────────────────────
      await sock.sendMessage(from, {
        video:    videoBuf,
        mimetype: 'video/mp4',
        fileName: resolvedTitle + '.mp4',
        caption:
          '🎬 *' + resolvedTitle + '*\n' +
          '⏱  ' + dur + '   ·   💾 ' + sizeMB + ' MB\n\n' +
          '_⚡ NovaSpark Bot_',
      }, { quoted: msg });

      // ── 2. Document (saveable .mp4) ────────────────────────────────────────
      await sock.sendMessage(from, {
        document: videoBuf,
        mimetype: 'video/mp4',
        fileName: resolvedTitle + '.mp4',
        caption:  '📎 ' + resolvedTitle + '.mp4',
      }, { quoted: msg });

      fs.unlink(tmpFile, () => {});

    } catch (e) {
      await sock.sendMessage(from, {
        text:
          '❌ *Download failed*\n\n' +
          '• Query: _' + query + '_\n' +
          '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
          '_💡 Try searching by video name instead of URL_',
      }, { quoted: msg });
    }
  },
};
