/**
 * ⚡ NovaSpark Bot v5 — Lyrics
 * Fetch song lyrics
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'lyrics',
  aliases: ['lyric', 'songtxt'],
  category: 'fun',
  description: 'Get song lyrics',
  usage: '.lyrics <song name>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const song = args.join(' ');
    if (!song) return reply('🎵 Please enter a song name!\n\n_Example: .lyrics Bohemian Rhapsody_');

    try {
      await reply(`🎵 Searching lyrics for *${song}*...`);
      const { data } = await axios.get(
        `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(song)}`,
        { timeout: 15000 }
      );

      const lyrics = data?.result?.lyrics;
      if (!lyrics) return reply(`❌ Could not find lyrics for "${song}".`);

      const maxLen = 4000;
      const out    = lyrics.length > maxLen ? lyrics.slice(0, maxLen) + '\n...(truncated)' : lyrics;
      await reply(`🎵 *${data.result?.title || song}*\n\n${out}`);
    } catch (e) {
      await reply(`❌ Could not fetch lyrics: ${e.message}`);
    }
  },
};
