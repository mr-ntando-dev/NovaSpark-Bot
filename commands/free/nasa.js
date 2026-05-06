/**
 * ⚡ NovaSpark Bot v5 — NASA Astronomy Picture of the Day
 * Fetches NASA APOD with title, explanation, and image URL
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'nasa',
  aliases: ['apod', 'spacetoday', 'space'],
  category: 'free',
  description: "NASA Astronomy Picture of the Day — today's cosmos in your chat",
  usage: '.nasa',

  async execute({ sock, from, msg, reply }) {
    // Uses NASA's public demo key — works for low traffic
    const API_KEY = 'DEMO_KEY';

    try {
      const { data } = await axios.get(
        `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
        { timeout: 10000 }
      );

      const title   = data.title || 'Astronomy Picture of the Day';
      const date    = data.date  || '';
      const expl    = data.explanation || '';
      const url     = data.url || '';
      const hdUrl   = data.hdurl || url;
      const mediaType = data.media_type || 'image';

      // Truncate explanation to ~400 chars
      const shortExpl = expl.length > 400 ? expl.slice(0, 397) + '...' : expl;

      const lines = [
        '🚀 *NASA — Astronomy Picture of the Day*',
        '━'.repeat(36),
        '',
        `🌌 *${title}*`,
        `📅 ${date}`,
        '',
        shortExpl,
        '',
        mediaType === 'image'
          ? `🖼️ *Image:* ${hdUrl}`
          : `🎬 *Video:* ${url}`,
        '',
        '_Source: NASA APOD (api.nasa.gov)_',
      ];

      // Send image if available
      if (mediaType === 'image' && url) {
        try {
          await sock.sendMessage(from, {
            image: { url },
            caption: lines.join('\n'),
          }, { quoted: msg });
          return;
        } catch { /* fall through to text */ }
      }

      await reply(lines.join('\n'));
    } catch (err) {
      await reply(
        '🚀 *NASA APOD*\n' +
        '━'.repeat(28) + '\n\n' +
        '❌ Could not fetch today\'s picture. NASA\'s servers are probably admiring the stars too.\n\n' +
        '_Try again in a moment, or visit: https://apod.nasa.gov_'
      );
    }
  },
};
