/**
 * ⚡ NovaSpark Bot v9 — Instagram Downloader
 * Photos, Reels, Videos, Carousels — handles multi-media posts
 * API cascade: Siputzx → EliteProTech → ruhend-scraper (igdl)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const IG_PATTERNS = [
  /https?:\/\/(?:www\.)?instagram\.com\/p\//,
  /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
  /https?:\/\/(?:www\.)?instagram\.com\/tv\//,
  /https?:\/\/(?:www\.)?instagram\.com\/stories\//,
  /https?:\/\/(?:www\.)?instagram\.com\/s\//,
];

// Deduplicate media items by URL
function dedupeMedia(arr) {
  const seen = new Set();
  return arr.filter(m => {
    if (!m.url || seen.has(m.url)) return false;
    seen.add(m.url); return true;
  });
}

// ── API cascade ────────────────────────────────────────────────────────────
async function downloadIG(url) {
  const enc = encodeURIComponent(url);

  // API 1: Siputzx
  try {
    const r = await axios.get('https://api.siputzx.my.id/api/d/ig?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    if (r.data?.status && r.data.data?.length)
      return r.data.data.map(m => ({ url: m.url, type: m.type || 'video' }));
  } catch {}

  // API 2: EliteProTech
  try {
    const r = await axios.get('https://eliteprotech-apis.zone.id/igdown?url=' + enc, { timeout: 25000, headers: { 'User-Agent': UA } });
    const d = r.data;
    if (d?.success && d.data?.length)
      return d.data.map(m => ({ url: m.url || m.downloadURL, type: m.type || 'video' }));
    if (d?.success && d.downloadURL)
      return [{ url: d.downloadURL, type: 'video' }];
  } catch {}

  // API 3: ruhend-scraper igdl (npm package fallback)
  try {
    const { igdl } = require('ruhend-scraper');
    const result = await igdl(url);
    if (result?.data?.length)
      return dedupeMedia(result.data.map(m => ({ url: m.url, type: m.type || 'video' })));
  } catch {}

  throw new Error('All Instagram APIs failed — post may be private or deleted.');
}

// ── Command ────────────────────────────────────────────────────────────────
module.exports = {
  name: 'instagram',
  aliases: ['ig', 'insta', 'igdl', 'reels'],
  category: 'downloads',
  description: 'Download Instagram photos, reels, videos and carousels',
  usage: '.ig <Instagram URL>',

  async execute({ sock, msg, from, args, reply }) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return reply(
      '📸 *Instagram Downloader*\n\n' +
      'Usage: `.ig <Instagram URL>`\n\n' +
      '_Supports: posts, reels, videos, stories, carousels_'
    );
    if (!IG_PATTERNS.some(p => p.test(url)))
      return reply('❌ That does not look like a valid Instagram link.');

    try {
      await sock.sendMessage(from, { react: { text: '📥', key: msg.key } });

      const mediaList = await downloadIG(url);
      const unique    = dedupeMedia(mediaList);

      if (!unique.length) return reply('❌ No media found — the post might be private.');

      let sent = 0;
      for (const media of unique.slice(0, 10)) {
        const isVideo = media.type === 'video' ||
          /\.(mp4|mov|webm)$/i.test(media.url) ||
          media.url.includes('video');

        try {
          if (isVideo) {
            const tmpFile = path.join(os.tmpdir(), 'ns_ig_' + Date.now() + '_' + sent + '.mp4');
            const dl = await axios.get(media.url, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA }, maxRedirects: 10 });
            fs.writeFileSync(tmpFile, Buffer.from(dl.data));
            await sock.sendMessage(from, {
              video:    fs.readFileSync(tmpFile),
              mimetype: 'video/mp4',
              fileName: 'instagram.mp4',
              caption:  sent === 0 ? '_⚡ NovaSpark Bot — Instagram_' : undefined,
            }, { quoted: msg });
            fs.unlink(tmpFile, () => {});
          } else {
            await sock.sendMessage(from, {
              image:   { url: media.url },
              caption: sent === 0 ? '_⚡ NovaSpark Bot — Instagram_' : undefined,
            }, { quoted: msg });
          }
          sent++;
        } catch (_) {}
      }

      if (!sent) return reply('❌ Could not download any media from that post.');

    } catch (e) {
      await reply(
        '❌ *Instagram Download Failed*\n\n' +
        '• Reason: ' + e.message.split('\n')[0] + '\n\n' +
        '_💡 Make sure the post is public and the URL is correct._'
      );
    }
  },
};
