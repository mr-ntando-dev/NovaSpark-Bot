/**
 * ⚡ NovaSpark Bot v9 — Spotify Downloader
 * Downloads Spotify tracks as MP3 — direct API or YouTube fallback
 * API cascade: Siputzx → SpotifyDown → YouTube + yt-dlp fallback
 * By Dev-Ntando
 */
'use strict';
const axios      = require('axios');
const yts        = require('yt-search');
const fs         = require('fs');
const path       = require('path');
const os         = require('os');
const { exec }   = require('child_process');
const { promisify } = require('util');
const execAsync  = promisify(exec);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const SP_PATTERNS = [
  /https?:\/\/open\.spotify\.com\/track\//,
  /https?:\/\/open\.spotify\.com\/album\//,
  /https?:\/\/open\.spotify\.com\/playlist\//,
  /https?:\/\/spotify\.link\//,
];

// ── Ensure file is real MP3 (convert if MP4/M4A container) ───────────────
// FIX: works with file paths only — never loads full file into RAM
async function ensureMp3File(inputFile) {
  const buf = Buffer.allocUnsafe(4);
  const fd  = fs.openSync(inputFile, 'r');
  fs.readSync(fd, buf, 0, 4, 0);
  fs.closeSync(fd);
  const isRealMp3 = (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) ||
                    (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0);
  if (isRealMp3) return inputFile;
  const outFile = inputFile.replace(/\.(mp3|mp4|m4a)$/, '_conv.mp3');
  await execAsync(`ffmpeg -y -i "${inputFile}" -acodec libmp3lame -q:a 3 "${outFile}"`, { timeout: 90000 });
  fs.unlink(inputFile, () => {});
  return outFile;
}

// ── Get Spotify track metadata + optional direct download link ─────────────
async function getSpotifyMeta(url) {
  const enc = encodeURIComponent(url);

  // Siputzx metadata
  try {
    const r = await axios.get('https://api.siputzx.my.id/api/d/spotify?url=' + enc, { timeout: 20000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && d.data)
      return { title: d.data.title, artist: d.data.artists, duration: d.data.duration, thumb: d.data.thumbnail, downloadUrl: d.data.download };
  } catch {}

  // SpotifyDown
  try {
    const r = await axios.get('https://spotifydown.com/api/download?url=' + enc, {
      timeout: 20000, headers: { 'User-Agent': UA, Origin: 'https://spotifydown.com', Referer: 'https://spotifydown.com/' }
    });
    const d = r.data;
    if (d?.success && d.link)
      return { title: d.metadata?.title || 'Spotify Track', artist: d.metadata?.artists || '', thumb: d.metadata?.cover || null, downloadUrl: d.link };
  } catch {}

  return null;
}

// ── YouTube fallback download ──────────────────────────────────────────────
async function downloadViaYouTube(title, artist) {
  const query   = (title + ' ' + artist).trim();
  const { videos } = await yts(query);
  if (!videos?.length) throw new Error('No YouTube match found for this track.');
  const videoUrl = videos[0].url;

  // Try yt-dlp
  let ytdlpCmd = null;
  for (const cmd of ['yt-dlp', 'uvx yt-dlp']) {
    try { await execAsync(cmd + ' --version', { timeout: 8000 }); ytdlpCmd = cmd; break; } catch (_) {}
  }

  if (ytdlpCmd) {
    const tmpBase = path.join(os.tmpdir(), 'ns_sp_' + Date.now());
    await execAsync(ytdlpCmd + ' --no-playlist -x --audio-format mp3 --audio-quality 128K -o "' + tmpBase + '.%(ext)s" "' + videoUrl + '"', { timeout: 120000 });
    const outFile = tmpBase + '.mp3';
    if (fs.existsSync(outFile)) return { localFile: outFile };
  }

  // yt-dlp unavailable — use EliteProTech ytmp3 API
  const r = await axios.get('https://eliteprotech-apis.zone.id/ytdown?url=' + encodeURIComponent(videoUrl) + '&format=mp3', { timeout: 30000, headers: { 'User-Agent': UA } });
  if (r.data?.success && r.data.downloadURL) return { remoteUrl: r.data.downloadURL };
  throw new Error('YouTube fallback failed — yt-dlp unavailable and API returned no URL.');
}

// ── Command ────────────────────────────────────────────────────────────────
module.exports = {
  name: 'spotify',
  aliases: ['sp', 'spdl', 'spotifydl'],
  category: 'downloads',
  description: 'Download Spotify tracks as MP3',
  usage: '.spotify <Spotify track URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return reply(
      '🟢 *Spotify Downloader*\n\n' +
      'Usage: `.spotify <Spotify track URL>`\n\n' +
      '_Supports: open.spotify.com/track/..._\n' +
      '_Delivers MP3 + info card_'
    );
    if (!SP_PATTERNS.some(p => p.test(url)))
      return reply('❌ That does not look like a Spotify track link.\n_Only individual tracks are supported._');

    try {
      await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

      const meta          = await getSpotifyMeta(url);
      const displayTitle  = meta?.title  || 'Spotify Track';
      const displayArtist = meta?.artist || '';

      let tmpFile;

      if (meta?.downloadUrl) {
        tmpFile = path.join(os.tmpdir(), 'ns_sp_' + Date.now() + '.mp3');
        const dlRes = await axios.get(meta.downloadUrl, { responseType: 'arraybuffer', timeout: 90000, headers: { 'User-Agent': UA }, maxRedirects: 10 });
        fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));
        tmpFile = await ensureMp3File(tmpFile);
      } else {
        await sock.sendMessage(from, { text: '🔍 _Matching track on YouTube, please wait..._' }, { quoted: msg });
        const result = await downloadViaYouTube(displayTitle, displayArtist);
        if (result.localFile) {
          tmpFile = await ensureMp3File(result.localFile);
        } else {
          tmpFile = path.join(os.tmpdir(), 'ns_sp_' + Date.now() + '.mp3');
          const dlRes = await axios.get(result.remoteUrl, { responseType: 'arraybuffer', timeout: 90000, headers: { 'User-Agent': UA }, maxRedirects: 10 });
          fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));
          tmpFile = await ensureMp3File(tmpFile);
        }
      }

      // FIX: use statSync for size — no readFileSync needed
      const sizeMB   = (fs.statSync(tmpFile).size / 1024 / 1024).toFixed(1);
      const fileName = (displayTitle + (displayArtist ? ' - ' + displayArtist : '')).replace(/[^\w\s\-]/g, '').trim() + '.mp3';

      // ── 1. Playable audio — streams from disk, ~0 RAM ─────────────────
      await sock.sendMessage(from, {
        audio:    { url: tmpFile },
        mimetype: 'audio/mpeg',
        fileName: fileName,
        ptt:      false,
      }, { quoted: msg });

      // ── 2. Info card ───────────────────────────────────────────────────
      const card =
        '🟢 *' + displayTitle + '*\n' +
        (displayArtist ? '🎤 ' + displayArtist + '\n' : '') +
        '💾 ' + sizeMB + ' MB\n\n' +
        '_⚡ NovaSpark Bot — tap audio above to play_';

      if (meta?.thumb) {
        await sock.sendMessage(from, { image: { url: meta.thumb }, caption: card }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: card }, { quoted: msg });
      }

      // ── 3. Saveable document — streams from disk, ~0 RAM ──────────────
      await sock.sendMessage(from, {
        document: { url: tmpFile },
        mimetype: 'audio/mpeg',
        fileName: fileName,
        caption:  '📎 ' + fileName,
      }, { quoted: msg });

      fs.unlink(tmpFile, () => {});

    } catch (e) {
      await reply(
        '❌ *Spotify Download Failed*\n\n' +
        '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
        '_💡 Only individual tracks are supported — not playlists or albums._'
      );
    }
  },
};
