/**
 * ⚡ NovaSpark Bot v5 — YouTube Audio Downloader
 * .song / .play — search by name OR paste any YouTube URL (shorts, live, music)
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
      const r = await axios.get('https://ytdl.vreden.web.id/api/v1/dl?url=' + encoded + '&format=mp3', { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.download && r.data.result.download.url)
        return { download: r.data.result.download.url, title: r.data.result.title, thumb: r.data.result.thumbnail, duration: r.data.result.duration };
      throw new Error('vreden no data');
    },
    async () => {
      const r = await axios.get('https://eliteprotech-apis.zone.id/ytdown?url=' + encoded + '&format=mp3', { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.downloadURL)
        return { download: r.data.downloadURL, title: r.data.title, thumb: r.data.thumbnail };
      throw new Error('EliteProTech no data');
    },
    async () => {
      const r = await axios.get('https://api.yupra.my.id/api/downloader/ytmp3?url=' + encoded, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.data && r.data.data.download_url)
        return { download: r.data.data.download_url, title: r.data.data.title, thumb: r.data.data.thumbnail, duration: r.data.data.duration };
      throw new Error('Yupra no data');
    },
    async () => {
      const r = await axios.get('https://api.nusantara-bot.biz.id/ytdl/mp3?url=' + encoded, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.dl_url)
        return { download: r.data.result.dl_url, title: r.data.result.title, thumb: r.data.result.thumbnail };
      throw new Error('Nusantara no data');
    },
    async () => {
      const r = await axios.get('https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=' + encoded, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.dl) return { download: r.data.dl, title: r.data.title, thumb: r.data.thumb };
      throw new Error('Okatsu no data');
    },
  ];
  const errors = [];
  for (const fn of apis) {
    try { return await fn(); } catch (e) { errors.push(e.message); }
  }
  throw new Error('All audio APIs failed — ' + errors.join(' | '));
}

module.exports = {
  name: 'ytmp3',
  aliases: ['song', 'play', 'mp3', 'audio', 'ytaudio'],
  category: 'downloads',
  description: 'Download YouTube audio — search by name or paste any YouTube URL',
  usage: '.song <name or YouTube URL>',

  async execute({ sock, msg, from, args, reply }) {
    const query = args.join(' ').trim();
    if (!query) return reply(
      '🎵 *NovaSpark Downloader*\n\n' +
      'Usage:\n' +
      '• .song Blinding Lights\n' +
      '• .play Minister GUC captured\n' +
      '• .song https://youtu.be/xxxxx\n' +
      '• .song https://www.youtube.com/shorts/xxxxx'
    );

    await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } });

    let videoUrl, videoTitle, videoThumb, videoDuration;

    try {
      if (/youtu\.?be|youtube\.com/i.test(query)) {
        videoUrl   = normalizeYtUrl(query);
        videoTitle = 'Resolving...';
      } else {
        await sock.sendMessage(from, {
          text:
            '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
            '  🎵 *NovaSpark Downloader*\n' +
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
            '🎵 *' + videoTitle + '*\n' +
            '⏱ ' + (videoDuration || '') + '\n\n' +
            '╔══════════════════════╗\n' +
            '  ⬇️  *DOWNLOADING AUDIO*  \n' +
            '  ' + progressBar(40) + ' 40%\n' +
            '╚══════════════════════╝\n\n' +
            '_🔄 Fetching from servers..._',
        }, { quoted: msg });
      }

      const data = await tryApis(videoUrl);
      const resolvedTitle = (data.title || videoTitle || 'Song').replace(/[^\w\s\-–]/g, '').trim();

      if (!videoThumb && data.thumb) {
        await sock.sendMessage(from, {
          image: { url: data.thumb },
          caption:
            '🎵 *' + resolvedTitle + '*\n\n' +
            '╔══════════════════════╗\n' +
            '  ⬇️  *DOWNLOADING AUDIO*  \n' +
            '  ' + progressBar(60) + ' 60%\n' +
            '╚══════════════════════╝\n\n' +
            '_🔄 Almost there..._',
        }, { quoted: msg });
      }

      const tmpFile = path.join(os.tmpdir(), 'ns_audio_' + Date.now() + '.mp3');
      const dlRes   = await axios.get(data.download, { responseType: 'arraybuffer', timeout: 90000, headers: { 'User-Agent': UA } });
      fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));
      const sizeMB  = (fs.statSync(tmpFile).size / 1024 / 1024).toFixed(1);
      const audioBuffer = fs.readFileSync(tmpFile);
      const thumb   = videoThumb || data.thumb || null;
      const dur     = videoDuration || data.duration || '—';

      const caption =
        '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
        '  🎵 *NovaSpark Music*\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
        '📀 *' + resolvedTitle + '*\n' +
        '⏱  Duration : ' + dur + '\n' +
        '💾  Size     : ' + sizeMB + ' MB\n' +
        progressBar(100) + ' ✅\n\n' +
        '_⚡ Powered by NovaSpark Bot_';

      // 1️⃣ Send as playable audio (WhatsApp audio player)
      await sock.sendMessage(from, {
        audio:    audioBuffer,
        mimetype: 'audio/mp4',
        fileName: resolvedTitle + '.mp3',
        ptt:      false,
      }, { quoted: msg });

      // 2️⃣ Send completion card — with thumbnail if available
      if (thumb) {
        await sock.sendMessage(from, {
          image:   { url: thumb },
          caption: caption,
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: caption }, { quoted: msg });
      }

      // 3️⃣ Send as document so users can save the mp3 file directly
      await sock.sendMessage(from, {
        document: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: resolvedTitle + '.mp3',
        caption:  '📎 *' + resolvedTitle + '.mp3* — tap to save',
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
          '_💡 Tip: Try searching by song name instead of URL_',
      }, { quoted: msg });
    }
  },
};
