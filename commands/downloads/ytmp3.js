/**
 * ⚡ NovaSpark Bot v9 — YouTube Audio Downloader
 * .song / .play — search by name OR paste any YouTube URL (shorts, live, music)
 * Multi-API fallback + yt-dlp local fallback | Clean professional output
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const yts   = require('yt-search');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

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

// ── yt-dlp local fallback (iron-clad — no third party APIs needed) ────────
async function tryYtDlp(youtubeUrl) {
  let ytdlpCmd = null;
  for (const cmd of ['yt-dlp', 'uvx yt-dlp']) {
    try { await execAsync(cmd + ' --version', { timeout: 10000 }); ytdlpCmd = cmd; break; }
    catch (_) {}
  }
  if (!ytdlpCmd) throw new Error('yt-dlp not available on this server');

  const tmpBase    = path.join(os.tmpdir(), 'ns_ytdlp_' + Date.now());
  const outputFile = tmpBase + '.mp3';
  let title = 'Unknown', thumb = null, duration = '--';

  try {
    const { stdout } = await execAsync(
      ytdlpCmd + ' --no-playlist --print "%(title)s|||%(thumbnail)s|||%(duration_string)s" "' + youtubeUrl + '"',
      { timeout: 30000 }
    );
    const parts = stdout.trim().split('|||');
    if (parts[0]) title    = parts[0];
    if (parts[1]) thumb    = parts[1];
    if (parts[2]) duration = parts[2];
  } catch (_) {}

  await execAsync(
    ytdlpCmd + ' --no-playlist -x --audio-format mp3 --audio-quality 128K -o "' + tmpBase + '.%(ext)s" "' + youtubeUrl + '"',
    { timeout: 120000 }
  );

  if (!fs.existsSync(outputFile)) throw new Error('yt-dlp produced no output file');
  return { localFile: outputFile, title, thumb, duration };
}

// ── Remote API cascade ─────────────────────────────────────────────────────
async function tryApis(youtubeUrl) {
  const encoded = encodeURIComponent(youtubeUrl);
  const apis = [
    // API 1: EliteProTech — primary, confirmed working April 2026
    async () => {
      const r = await axios.get('https://eliteprotech-apis.zone.id/ytdown?url=' + encoded + '&format=mp3', { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.downloadURL)
        return { download: r.data.downloadURL, title: r.data.title, thumb: null, duration: '--' };
      throw new Error('EliteProTech: ' + JSON.stringify(r.data).slice(0, 80));
    },
    // API 2: ymcdn direct (same backend as EliteProTech)
    async () => {
      const r = await axios.get('https://ydl.ymcdn.org/api/v1/dl?url=' + encoded + '&format=mp3', { timeout: 30000, headers: { 'User-Agent': UA, Referer: 'https://eliteprotech-apis.zone.id/' } });
      if (r.data && r.data.result && r.data.result.download && r.data.result.download.url)
        return { download: r.data.result.download.url, title: r.data.result.title, thumb: r.data.result.thumbnail || null, duration: r.data.result.duration || '--' };
      throw new Error('ymcdn: no data');
    },
    // API 3: Yupra (kept — may come back online)
    async () => {
      const r = await axios.get('https://api.yupra.my.id/api/downloader/ytmp3?url=' + encoded, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.success && r.data.data && r.data.data.download_url)
        return { download: r.data.data.download_url, title: r.data.data.title, thumb: r.data.data.thumbnail || null, duration: r.data.data.duration || '--' };
      throw new Error('Yupra: ' + (r.data && r.data.error ? r.data.error : 'no data'));
    },
    // API 4: vreden
    async () => {
      const r = await axios.get('https://ytdl.vreden.web.id/api/v1/dl?url=' + encoded + '&format=mp3', { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.download && r.data.result.download.url)
        return { download: r.data.result.download.url, title: r.data.result.title, thumb: r.data.result.thumbnail || null, duration: r.data.result.duration || '--' };
      throw new Error('vreden: no data');
    },
    // API 5: Nusantara
    async () => {
      const r = await axios.get('https://api.nusantara-bot.biz.id/ytdl/mp3?url=' + encoded, { timeout: 30000, headers: { 'User-Agent': UA } });
      if (r.data && r.data.result && r.data.result.dl_url)
        return { download: r.data.result.dl_url, title: r.data.result.title, thumb: r.data.result.thumbnail || null, duration: '--' };
      throw new Error('Nusantara: no data');
    },
  ];
  const errors = [];
  for (const fn of apis) {
    try { return await fn(); } catch (e) { errors.push(e.message); }
  }
  throw new Error('All remote audio APIs failed — ' + errors.join(' | '));
}

module.exports = {
  name: 'ytmp3',
  aliases: ['song', 'play', 'mp3', 'audio', 'ytaudio'],
  category: 'downloads',
  description: 'Download YouTube audio — search by name or paste any YouTube URL',
  usage: '.play <song name or YouTube URL>',

  async execute({ sock, msg, from, args, reply }) {
    const query = args.join(' ').trim();
    if (!query) return reply(
      '🎵 *NovaSpark Music*\n\n' +
      'Usage:\n' +
      '• `.play Blinding Lights`\n' +
      '• `.play Minister GUC captured`\n' +
      '• `.play https://youtu.be/xxxxx`'
    );

    await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } });

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

      let audioBuf, resolvedTitle, thumb, dur, tmpFile;

      // Try remote APIs first, fall back to yt-dlp local
      try {
        const data    = await tryApis(videoUrl);
        resolvedTitle = (data.title || videoTitle || 'Song').replace(/[^\w\s\-]/g, '').trim();
        thumb         = videoThumb || data.thumb || null;
        dur           = videoDuration || data.duration || '--';

        tmpFile = path.join(os.tmpdir(), 'ns_audio_' + Date.now() + '.mp3');
        const dlRes = await axios.get(data.download, { responseType: 'arraybuffer', timeout: 90000, headers: { 'User-Agent': UA }, maxRedirects: 10 });
        fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));
        audioBuf = fs.readFileSync(tmpFile);

      } catch (_apiErr) {
        // yt-dlp fallback — works even when all remote APIs are down
        await sock.sendMessage(from, {
          text: '⏳ _Remote APIs busy — using local downloader, please wait..._',
        }, { quoted: msg });

        const result  = await tryYtDlp(videoUrl);
        tmpFile       = result.localFile;
        audioBuf      = fs.readFileSync(tmpFile);
        resolvedTitle = (result.title || videoTitle || 'Song').replace(/[^\w\s\-]/g, '').trim();
        thumb         = videoThumb || result.thumb || null;
        dur           = videoDuration || result.duration || '--';
      }

      const sizeMB = (audioBuf.length / 1024 / 1024).toFixed(1);

      // ── 1. Playable audio ─────────────────────────────────────────────────
      await sock.sendMessage(from, {
        audio:    audioBuf,
        mimetype: 'audio/mp4',
        fileName: resolvedTitle + '.mp3',
        ptt:      false,
      }, { quoted: msg });

      // ── 2. Info card (thumbnail + metadata) ──────────────────────────────
      const card =
        '🎵 *' + resolvedTitle + '*\n' +
        '⏱  ' + dur + '   ·   💾 ' + sizeMB + ' MB\n\n' +
        '_⚡ NovaSpark Bot — tap audio above to play_';

      if (thumb) {
        await sock.sendMessage(from, {
          image:   { url: thumb },
          caption: card,
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: card }, { quoted: msg });
      }

      // ── 3. Document (saveable .mp3) ───────────────────────────────────────
      await sock.sendMessage(from, {
        document: audioBuf,
        mimetype: 'audio/mpeg',
        fileName: resolvedTitle + '.mp3',
        caption:  '📎 ' + resolvedTitle + '.mp3',
      }, { quoted: msg });

      if (tmpFile) fs.unlink(tmpFile, () => {});

    } catch (e) {
      await sock.sendMessage(from, {
        text:
          '❌ *Download failed*\n\n' +
          '• Query: _' + query + '_\n' +
          '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
          '_💡 Try searching by song name instead of URL_',
      }, { quoted: msg });
    }
  },
};
