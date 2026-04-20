/**
 * ⚡ NovaSpark Bot v5 — TikTok Downloader
 * No watermark — video + audio options
 * Multi-API: Siputzx → SnapTik fallback
 * Ported & adapted from KnightBot-Mini + Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const TT_PATTERNS = [
  /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\//,
  /https?:\/\/(?:www\.)?tiktok\.com\/@/,
  /https?:\/\/(?:www\.)?tiktok\.com\/t\//,
];

async function downloadTT(url) {
  // API 1 — Siputzx
  try {
    const r = await axios.get(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && d.data?.video) return { videoUrl: d.data.video, audioUrl: d.data.audio, title: d.data.title };
  } catch {}

  // API 2 — Tiklydown
  try {
    const r = await axios.get(`https://tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.video?.noWatermark) return { videoUrl: d.video.noWatermark, title: d.title };
  } catch {}

  // API 3 — SnapTik
  try {
    const r = await axios.post('https://snaptik.app/abc2.php', `url=${encodeURIComponent(url)}`, { timeout: 20000, headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA } });
    const match = r.data?.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
    if (match?.[1]) return { videoUrl: match[1], title: 'TikTok Video' };
  } catch {}

  throw new Error('All TikTok APIs failed — link may be private or region-locked.');
}

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl', 'ttdownload'],
  category: 'downloads',
  description: 'Download TikTok video (no watermark)',
  usage: '.tiktok <TikTok URL>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const url = args[0] || args.join(' ');
    if (!url) return reply('📱 Provide a TikTok URL!\n\n_Example: .tiktok https://vm.tiktok.com/xxx_');
    if (!TT_PATTERNS.some(p => p.test(url))) return reply('❌ That does not look like a TikTok link.');

    try {
      await sock.sendMessage(from, { react: { text: '⬇️', key: msg.key } });
      await reply('⬇️ Downloading TikTok (no watermark)...');

      const data    = await downloadTT(url);
      const tmpFile = path.join(os.tmpdir(), `ns_tt_${Date.now()}.mp4`);
      const dlRes   = await axios.get(data.videoUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA } });
      fs.writeFileSync(tmpFile, Buffer.from(dlRes.data));

      await sock.sendMessage(from, {
        video:    fs.readFileSync(tmpFile),
        mimetype: 'video/mp4',
        fileName: 'tiktok.mp4',
        caption:  `🎵 *${data.title || 'TikTok Video'}*\n\n_⚡ NovaSpark Bot — No Watermark_`,
      }, { quoted: msg });

      fs.unlink(tmpFile, () => {});
    } catch (e) {
      await reply(`❌ Failed: ${e.message}`);
    }
  },
};
