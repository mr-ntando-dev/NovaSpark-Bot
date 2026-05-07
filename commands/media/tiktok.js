/**
 * ⚡ NovaSpark v4 — TikTok Downloader
 * .tiktok <url> — Download TikTok video without watermark
 * Uses tikwm.com free API
 * NEVER in other basic MD bots.
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');
const { Readable } = require('stream');

module.exports = {
  name: 'tiktoksearch',
  aliases: ['ttinfo', 'tik'],
  description: '🎵 Download TikTok video (no watermark)',
  category: 'media',

  execute: async ({ sock, msg, from, args, reply }) => {
    const url = args[0];
    if (!url || !url.includes('tiktok.com')) {
      return reply(
        '🎵 *TikTok Downloader*\n\n' +
        'Usage: `.tiktok <url>`\n' +
        'Example: `.tiktok https://www.tiktok.com/@user/video/123`\n\n' +
        '_Downloads without watermark._'
      );
    }

    await reply('⏳ Downloading TikTok video (no watermark)...');
    try {
      const { data } = await axios.post(
        'https://www.tikwm.com/api/',
        new URLSearchParams({ url, hd: '1' }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
      );

      if (!data?.data?.play) throw new Error('No video URL returned');

      const videoUrl = data.data.hdplay || data.data.play;
      const title    = data.data.title   || 'TikTok Video';
      const author   = data.data.author?.nickname || 'Unknown';
      const duration = data.data.duration || 0;

      // Download video buffer
      const vidResp = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 30000 });
      const buffer  = Buffer.from(vidResp.data);

      await sock.sendMessage(from, {
        video:    buffer,
        caption:  `🎵 *${title}*\n👤 @${author} | ⏱ ${duration}s\n_⚡ NovaSpark Bot v4_`,
        mimetype: 'video/mp4',
      }, { quoted: msg });
    } catch (e) {
      return reply(`❌ Could not download that TikTok.\n_Reason: ${e.message}_`);
    }
  },
};
