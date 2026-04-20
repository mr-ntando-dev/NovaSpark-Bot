/**
 * ⚡ NovaSpark Bot v5 — Instagram Downloader
 * Photos, Reels, Videos — handles multi-media posts
 * API: Siputzx → ruhend-scraper fallback
 * Ported & adapted from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const IG_PATTERNS = [
  /https?:\/\/(?:www\.)?instagram\.com\/p\//,
  /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
  /https?:\/\/(?:www\.)?instagram\.com\/tv\//,
  /https?:\/\/(?:www\.)?instagram\.com\/stories\//,
];

async function downloadIG(url) {
  // API 1 — Siputzx
  try {
    const r = await axios.get(`https://api.siputzx.my.id/api/d/ig?url=${encodeURIComponent(url)}`, { timeout: 20000, headers: { 'User-Agent': UA } });
    if (r.data?.status && r.data.data?.length) {
      return r.data.data.map(m => ({ url: m.url, type: m.type || 'video' }));
    }
  } catch {}

  // API 2 — SnapSave
  try {
    const r = await axios.get(`https://snapsave.app/api/ajaxSearch?q=${encodeURIComponent(url)}&lang=en&version=v2`, { timeout: 20000, headers: { 'User-Agent': UA } });
    const items = r.data?.data;
    if (Array.isArray(items) && items.length) {
      return items.map(i => ({ url: i.url, type: i.type || 'image' }));
    }
  } catch {}

  // API 3 — ruhend-scraper (optional, if installed)
  try {
    const { igdl } = require('ruhend-scraper');
    const res = await igdl(url);
    if (res?.data?.length) return res.data.map(m => ({ url: m.url, type: m.type || 'image' }));
  } catch {}

  throw new Error('All Instagram APIs failed — post may be private.');
}

module.exports = {
  name: 'instagram',
  aliases: ['ig', 'igdl', 'insta', 'reels', 'reel'],
  category: 'downloads',
  description: 'Download Instagram photos/reels/videos',
  usage: '.ig <Instagram URL>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const url = (args[0] || args.join(' ')).trim();
    if (!url) return reply('📸 Provide an Instagram URL!\n\n_Example: .ig https://www.instagram.com/reel/xxx_');
    if (!IG_PATTERNS.some(p => p.test(url))) return reply('❌ That does not look like an Instagram post/reel link.');

    try {
      await sock.sendMessage(from, { react: { text: '📥', key: msg.key } });
      await reply('📥 Fetching Instagram media...');

      const media = await downloadIG(url);
      let sent = 0;

      for (const item of media.slice(0, 10)) {
        try {
          if (item.type === 'video' || item.url?.includes('.mp4')) {
            await sock.sendMessage(from, {
              video:   { url: item.url },
              mimetype: 'video/mp4',
              caption: sent === 0 ? `📸 Instagram Download\n_⚡ NovaSpark Bot_` : '',
            }, { quoted: sent === 0 ? msg : undefined });
          } else {
            await sock.sendMessage(from, {
              image:   { url: item.url },
              caption: sent === 0 ? `📸 Instagram Download\n_⚡ NovaSpark Bot_` : '',
            }, { quoted: sent === 0 ? msg : undefined });
          }
          sent++;
          await new Promise(r => setTimeout(r, 800));
        } catch {}
      }

      if (!sent) await reply('❌ No media could be downloaded from that link.');
    } catch (e) {
      await reply(`❌ Failed: ${e.message}`);
    }
  },
};
