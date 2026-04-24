/**
 * ⚡ NovaSpark v4 — YouTube Search + Info
 * .yt <query> — Search YouTube, return top result info + thumbnail
 * .ytmp3 <url> — Audio info (use yt-dlp on VPS)
 * Uses YouTube oEmbed + no-auth search via yt-search
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

async function ytSearch(query) {
  // Use invidious public API (no key needed)
  const instances = [
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de',
    'https://invidious.privacydev.net',
  ];
  for (const base of instances) {
    try {
      const { data } = await axios.get(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, { timeout: 7000 });
      if (data?.length) return data[0];
    } catch {}
  }
  return null;
}

module.exports = {
  name: 'yt',
  aliases: ['youtube', 'ytsearch'],
  description: '▶️ Search YouTube — top result with thumbnail & info',
  category: 'media',

  execute: async ({ sock, msg, from, args, reply }) => {
    const query = args.join(' ').trim();
    if (!query) return reply('▶️ Usage: `.yt <search query>`\nExample: `.yt Afrobeats 2026 mix`');

    await reply(`⏳ Searching YouTube for: *${query}*...`);
    try {
      const v = await ytSearch(query);
      if (!v) return reply('❌ No results found. Try a different search.');

      const duration = Math.floor(v.lengthSeconds / 60) + ':' + String(v.lengthSeconds % 60).padStart(2, '0');
      const views    = Number(v.viewCount).toLocaleString();
      const author   = v.author;
      const title    = v.title;
      const vidUrl   = `https://www.youtube.com/watch?v=${v.videoId}`;

      // Try thumbnail
      const thumb = v.videoThumbnails?.find(t => t.quality === 'medium')?.url || v.videoThumbnails?.[0]?.url;
      const cap   =
        `▶️ *${title}*\n\n` +
        `👤 Channel: ${author}\n` +
        `⏱ Duration: ${duration}\n` +
        `👁️ Views: ${views}\n` +
        `🔗 ${vidUrl}\n\n` +
        `_⚡ NovaSpark Bot v4_`;

      if (thumb) {
        try {
          const imgBuf = await axios.get(thumb, { responseType: 'arraybuffer', timeout: 8000 });
          return await sock.sendMessage(from, {
            image:   Buffer.from(imgBuf.data),
            caption: cap,
          }, { quoted: msg });
        } catch {}
      }
      return reply(cap);
    } catch (e) {
      return reply(`❌ Search failed: ${e.message}`);
    }
  },
};
