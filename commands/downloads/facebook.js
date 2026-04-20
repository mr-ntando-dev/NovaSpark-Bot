/**
 * ⚡ NovaSpark Bot v5 — Facebook Video Downloader
 * HD + SD quality options
 * API: Hanggts → Siputzx fallback
 * Ported & adapted from KnightBot-Mini + Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const FB_PATTERNS = [
  /https?:\/\/(?:www\.|m\.)?facebook\.com\//,
  /https?:\/\/(?:www\.|m\.)?fb\.com\//,
  /https?:\/\/fb\.watch\//,
];

async function downloadFB(url) {
  // Resolve redirect first
  let resolved = url;
  try {
    const r = await axios.get(url, { timeout: 10000, maxRedirects: 10, headers: { 'User-Agent': UA } });
    if (r.request?.res?.responseUrl) resolved = r.request.res.responseUrl;
  } catch {}

  // API 1 — Hanggts
  try {
    const r = await axios.get(`https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(resolved)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
    const d = r.data;
    const hd = d?.result?.hd || d?.data?.hd || d?.hd;
    const sd = d?.result?.sd || d?.data?.sd || d?.sd || d?.url || d?.download;
    if (hd || sd) return { hd, sd, title: d?.title || 'Facebook Video' };
  } catch {}

  // API 2 — Siputzx
  try {
    const r = await axios.get(`https://api.siputzx.my.id/api/d/fb?url=${encodeURIComponent(resolved)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && (d.data?.hd || d.data?.sd)) return { hd: d.data.hd, sd: d.data.sd, title: d.data.title };
  } catch {}

  throw new Error('All Facebook APIs failed — video may be private.');
}

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl', 'facebookdl'],
  category: 'downloads',
  description: 'Download Facebook videos (HD/SD)',
  usage: '.fb <Facebook URL>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return reply('📘 Provide a Facebook video URL!\n\n_Example: .fb https://www.facebook.com/watch?v=xxx_');
    if (!FB_PATTERNS.some(p => p.test(url))) return reply('❌ That does not look like a Facebook link.');

    try {
      await sock.sendMessage(from, { react: { text: '🔄', key: msg.key } });
      await reply('📥 Fetching Facebook video...');

      const data    = await downloadFB(url);
      const videoUrl = data.hd || data.sd;

      await sock.sendMessage(from, {
        video:   { url: videoUrl },
        mimetype: 'video/mp4',
        caption: `📘 *${data.title}*\n${data.hd ? '🔷 HD Quality' : '🔹 SD Quality'}\n\n_⚡ NovaSpark Bot_`,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Failed: ${e.message}`);
    }
  },
};
