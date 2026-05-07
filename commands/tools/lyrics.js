/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .lyrics <song name> — Fetch song lyrics
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'findlyrics',
  aliases: ['songlyrics', 'toollyric'],
  description: '🎵 Get song lyrics by name',
  category: 'tools',

  execute: async ({ args, reply }) => {
    if (!args.length) return reply('Usage: `.lyrics <song name>`\nExample: `.lyrics Bohemian Rhapsody`');

    const query = args.join(' ');
    try {
      const res = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`, { timeout: 8000 });
      const track = res.data?.data?.[0];
      if (!track) return reply(`❌ No results found for: "${query}"`);

      const lyricsRes = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist.name)}/${encodeURIComponent(track.title)}`, { timeout: 8000 });
      let lyrics = lyricsRes.data?.lyrics;
      if (!lyrics) return reply(`❌ Lyrics not available for: "${track.title}" by ${track.artist.name}`);

      // Trim to ~3500 chars to avoid WhatsApp truncation
      if (lyrics.length > 3500) lyrics = lyrics.slice(0, 3500) + '\n\n_[lyrics trimmed for length]_';

      return reply(
        `🎵 *${track.title}*\n` +
        `👤 ${track.artist.name}\n` +
        `${'━'.repeat(28)}\n\n` +
        `${lyrics}\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    } catch {
      return reply(`❌ Could not fetch lyrics for: "${query}". Try a different song name.`);
    }
  },
};
