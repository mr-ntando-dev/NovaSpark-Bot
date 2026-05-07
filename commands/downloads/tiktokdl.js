/**
 * ⚡ NovaSpark Bot v9 — TikTok Downloader
 * No watermark | Video + optional audio-only bonus
 * API cascade: Siputzx → Tiklydown → EliteProTech → ruhend-scraper (ttdl)
 * By Dev-Ntando
 *
 * FIX (memory): replaced fs.readFileSync(tmpVideo) → { url: tmpVideo } and
 * rewrote ensureMp3Buffer → ensureMp3File so no large Buffer is ever held in
 * RAM. Files are written to /tmp, sent by path, then deleted.
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Ensure file is real MP3 (convert if MP4/M4A container) ───────────────
// ✅ FIX: works entirely with file paths — never loads full file into RAM
async function ensureMp3File(inputFile) {
  const buf = Buffer.allocUnsafe(4);
  const fd  = fs.openSync(inputFile, 'r');
  fs.readSync(fd, buf, 0, 4, 0);
  fs.closeSync(fd);
  const isRealMp3 = (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) ||
                    (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0);
  if (isRealMp3) return inputFile; // already valid mp3

  // It's an MP4/M4A container — convert with ffmpeg
  const outFile = inputFile.replace(/\.(mp3|mp4|m4a)$/, '_conv.mp3');
  await execAsync(`ffmpeg -y -i "${inputFile}" -acodec libmp3lame -q:a 3 "${outFile}"`, { timeout: 90000 });
  fs.unlink(inputFile, () => {}); // remove original
  return outFile;
}

const TT_PATTERNS = [
  /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\//,
  /https?:\/\/(?:www\.)?tiktok\.com\/@/,
  /https?:\/\/(?:www\.)?tiktok\.com\/t\//,
];

// ── API cascade ────────────────────────────────────────────────────────────
async function downloadTT(url) {
  const enc = encodeURIComponent(url);

  // API 1: Siputzx
  try {
    const r = await axios.get('https://api.siputzx.my.id/api/d/tiktok?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && d.data?.video)
      return { videoUrl: d.data.video, audioUrl: d.data.audio || null, title: d.data.title || 'TikTok Video' };
  } catch {}

  // API 2: Tiklydown (no watermark, reliable)
  try {
    const r = await axios.get('https://tiklydown.eu.org/api/download?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.video?.noWatermark)
      return { videoUrl: d.video.noWatermark, audioUrl: d.video.cover || null, title: d.title || 'TikTok Video' };
  } catch {}

  // API 3: EliteProTech
  try {
    const r = await axios.get('https://eliteprotech-apis.zone.id/tiktokdown?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.success && (d.videoURL || d.downloadURL))
      return { videoUrl: d.videoURL || d.downloadURL, audioUrl: d.audioURL || null, title: d.title || 'TikTok Video' };
  } catch {}

  // API 4: ruhend-scraper ttdl (npm package fallback)
  try {
    const { ttdl } = require('ruhend-scraper');
    const result = await ttdl(url);
    if (result?.data?.length) {
      const videos = result.data.filter(m => /\.(mp4|mov|webm)/i.test(m.url) || m.type === 'video');
      if (videos.length)
        return { videoUrl: videos[0].url, audioUrl: null, title: result.title || 'TikTok Video' };
    }
  } catch {}

  throw new Error('All TikTok APIs failed — link may be private or region-locked.');
}

// ── Command ────────────────────────────────────────────────────────────────
module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl', 'ttdownload'],
  category: 'downloads',
  description: 'Download TikTok video without watermark',
  usage: '.tiktok <TikTok URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return reply(
      '🎵 *TikTok Downloader*\n\n' +
      'Usage: `.tiktok <TikTok URL>`\n\n' +
      '_Supports: tiktok.com, vm.tiktok.com, vt.tiktok.com_\n' +
      '_No Watermark · Video + Audio_'
    );
    if (!TT_PATTERNS.some(p => p.test(url)))
      return reply('❌ That does not look like a TikTok link.');

    try {
      await sock.sendMessage(from, { react: { text: '⬇️', key: msg.key } });

      const data     = await downloadTT(url);
      const tmpVideo = path.join(os.tmpdir(), 'ns_tt_' + Date.now() + '.mp4');
      const dlRes    = await axios.get(data.videoUrl, {
        responseType: 'arraybuffer', timeout: 90000,
        headers: { 'User-Agent': UA }, maxRedirects: 10,
      });
      fs.writeFileSync(tmpVideo, Buffer.from(dlRes.data));
      const sizeMB = (fs.statSync(tmpVideo).size / 1024 / 1024).toFixed(1);

      // ✅ FIX: { url: tmpVideo } streams from disk — no readFileSync, ~0 RAM
      await sock.sendMessage(from, {
        video:    { url: tmpVideo },
        mimetype: 'video/mp4',
        fileName: 'tiktok.mp4',
        caption:
          '🎵 *' + (data.title || 'TikTok Video') + '*\n' +
          '💾 ' + sizeMB + ' MB  ·  🚫 No Watermark\n\n' +
          '_⚡ NovaSpark Bot_',
      }, { quoted: msg });

      fs.unlink(tmpVideo, () => {});

      // Bonus: audio-only if available
      if (data.audioUrl) {
        try {
          const tmpAudio = path.join(os.tmpdir(), 'ns_tta_' + Date.now() + '.mp3');
          const aRes = await axios.get(data.audioUrl, {
            responseType: 'arraybuffer', timeout: 60000,
            headers: { 'User-Agent': UA }, maxRedirects: 10,
          });
          // ✅ FIX: write to file, convert via file path, send by path — no Buffer in RAM
          fs.writeFileSync(tmpAudio, Buffer.from(aRes.data));
          const finalAudio = await ensureMp3File(tmpAudio);
          await sock.sendMessage(from, {
            audio:    { url: finalAudio },
            mimetype: 'audio/mpeg',
            fileName: 'tiktok_audio.mp3',
            ptt:      false,
          }, { quoted: msg });
          fs.unlink(finalAudio, () => {});
        } catch (_) {}
      }

    } catch (e) {
      await reply(
        '❌ *TikTok Download Failed*\n\n' +
        '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
        '_💡 Make sure the video is public and the link is correct._'
      );
    }
  },
};
