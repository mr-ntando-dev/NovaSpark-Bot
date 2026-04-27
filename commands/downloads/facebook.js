/**
 * ⚡ NovaSpark Bot v9 — Facebook Video Downloader
 * HD + SD quality | Resolves fb.watch, m.facebook, and web links
 * API cascade: Hanggts → Siputzx → EliteProTech → @bochilteam/scraper-facebook
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const FB_PATTERNS = [
  /https?:\/\/(?:www\.|m\.)?facebook\.com\//,
  /https?:\/\/(?:www\.|m\.)?fb\.com\//,
  /https?:\/\/fb\.watch\//,
];

// ── Resolve short links / redirects ───────────────────────────────────────
async function resolveUrl(url) {
  try {
    const r = await axios.get(url, { timeout: 10000, maxRedirects: 10, headers: { 'User-Agent': UA } });
    return r.request?.res?.responseUrl || r.request?.responseURL || url;
  } catch { return url; }
}

// ── API cascade ────────────────────────────────────────────────────────────
async function downloadFB(rawUrl) {
  const url = await resolveUrl(rawUrl);
  const enc = encodeURIComponent(url);

  // API 1: Hanggts
  try {
    const r = await axios.get('https://api.hanggts.xyz/download/facebook?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    const hd = d?.result?.hd || d?.data?.hd || d?.hd;
    const sd = d?.result?.sd || d?.data?.sd || d?.sd || d?.url || d?.download;
    if (hd || sd) return { hd: hd || null, sd: sd || null, title: d?.title || 'Facebook Video' };
  } catch {}

  // API 2: Siputzx
  try {
    const r = await axios.get('https://api.siputzx.my.id/api/d/fb?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.status && (d.data?.hd || d.data?.sd))
      return { hd: d.data.hd || null, sd: d.data.sd || null, title: d.data.title || 'Facebook Video' };
  } catch {}

  // API 3: EliteProTech
  try {
    const r = await axios.get('https://eliteprotech-apis.zone.id/fbdown?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.success && (d.hd || d.sd || d.downloadURL))
      return { hd: d.hd || d.downloadURL || null, sd: d.sd || null, title: d.title || 'Facebook Video' };
  } catch {}

  // API 4: @bochilteam/scraper-facebook (npm package fallback)
  try {
    const { facebookdl } = require('@bochilteam/scraper-facebook');
    const data = await facebookdl(url);
    if (data?.video?.length) {
      const buf = await data.video[0].download();
      return { buffer: buf, title: data.title || 'Facebook Video' };
    }
  } catch {}

  throw new Error('All Facebook APIs failed — video may be private or region-locked.');
}

// ── Command ────────────────────────────────────────────────────────────────
module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl', 'facebookdl'],
  category: 'downloads',
  description: 'Download Facebook videos in HD or SD quality',
  usage: '.fb <Facebook URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return reply(
      '📘 *Facebook Downloader*\n\n' +
      'Usage: `.fb <Facebook video URL>`\n\n' +
      '_Supports: facebook.com, fb.watch, m.facebook.com_'
    );
    if (!FB_PATTERNS.some(p => p.test(url)))
      return reply('❌ That does not look like a Facebook link.');

    try {
      await sock.sendMessage(from, { react: { text: '📥', key: msg.key } });

      const data = await downloadFB(url);

      // Case: bochilteam returned a buffer directly
      if (data.buffer) {
        await sock.sendMessage(from, {
          video:    data.buffer,
          mimetype: 'video/mp4',
          caption:  '📘 *' + data.title + '*\n\n_⚡ NovaSpark Bot_',
        }, { quoted: msg });
        return;
      }

      const videoUrl = data.hd || data.sd;
      const quality  = data.hd ? '🔷 HD Quality' : '🔹 SD Quality';

      await sock.sendMessage(from, {
        video:    { url: videoUrl },
        mimetype: 'video/mp4',
        caption:  '📘 *' + data.title + '*\n' + quality + '\n\n_⚡ NovaSpark Bot_',
      }, { quoted: msg });

      // Offer SD too when both qualities exist
      if (data.hd && data.sd) {
        await sock.sendMessage(from, {
          video:    { url: data.sd },
          mimetype: 'video/mp4',
          caption:  '📘 *' + data.title + '*\n🔹 SD Quality (smaller file)\n\n_⚡ NovaSpark Bot_',
        }, { quoted: msg });
      }

    } catch (e) {
      await reply(
        '❌ *Facebook Download Failed*\n\n' +
        '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
        '_💡 Make sure the video is public and the link is correct._'
      );
    }
  },
};
