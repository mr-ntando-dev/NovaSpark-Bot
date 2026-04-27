/**
 * ⚡ NovaSpark Bot v9 — TikTok Downloader
 * No watermark | Video + optional audio-only bonus
 * API cascade: Siputzx → Tiklydown → EliteProTech → ruhend-scraper (ttdl)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

      // Send video
      await sock.sendMessage(from, {
        video:    fs.readFileSync(tmpVideo),
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
          fs.writeFileSync(tmpAudio, Buffer.from(aRes.data));
          await sock.sendMessage(from, {
            audio:    fs.readFileSync(tmpAudio),
            mimetype: 'audio/mp4',
            fileName: 'tiktok_audio.mp3',
            ptt:      false,
          }, { quoted: msg });
          fs.unlink(tmpAudio, () => {});
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
