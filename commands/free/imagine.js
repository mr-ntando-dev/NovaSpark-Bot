/**
 * NovaSpark Bot v3 — AI Image Generator (FREE)
 * .imagine <prompt>  — generates an image using Pollinations AI (no key needed)
 * Pollinations is free, fast, and produces solid results
 * By Dev-Ntando
 */
'use strict';

const axios    = require('axios');
const database = require('../../database');

// Aspect ratio presets
const RATIOS = {
  square:    { w: 1024, h: 1024 },
  landscape: { w: 1280, h: 720  },
  portrait:  { w: 720,  h: 1280 },
};

module.exports = {
  name: 'imagine',
  aliases: ['img', 'generate', 'draw', 'image', 'ai'],
  description: 'Generate an AI image from any text prompt (FREE)',
  category: 'free',

  execute: async ({ sock, from, sender, args, msg, reply }) => {
    database.logCommand(sender, 'imagine');

    // Parse flags: --landscape --portrait (default: square)
    let ratio  = 'square';
    let prompt = args.filter(a => {
      if (a === '--landscape') { ratio = 'landscape'; return false; }
      if (a === '--portrait')  { ratio = 'portrait';  return false; }
      return true;
    }).join(' ').trim();

    if (!prompt) {
      return reply(
        '🎨 *AI Image Generator*\n\n' +
        'Usage: *.imagine <prompt>*\n\n' +
        'Examples:\n' +
        '  .imagine a futuristic city at night with neon lights\n' +
        '  .imagine a golden retriever astronaut on Mars\n' +
        '  .imagine portrait of a Zimbabwean queen in royal attire\n\n' +
        'Optional flags:\n' +
        '  --landscape  (wide 16:9)\n' +
        '  --portrait   (tall 9:16)\n' +
        '  default      (1:1 square)\n\n' +
        '_Powered by Pollinations AI · Completely free_'
      );
    }

    await sock.sendPresenceUpdate('composing', from);
    await reply('🎨 _Generating your image… This takes ~10-20 seconds_');

    const { w, h } = RATIOS[ratio];

    try {
      // Pollinations AI — open, free, no API key, returns a PNG
      const encodedPrompt = encodeURIComponent(prompt);
      const seed          = Math.floor(Math.random() * 999999);
      const url           = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${w}&height=${h}&seed=${seed}&model=flux&nologo=true`;

      const { data: imgBuffer } = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout:      60000,
        headers: { 'User-Agent': 'NovaSpark-Bot/3.0' },
      });

      const buffer = Buffer.from(imgBuffer);

      // Verify we actually got an image (not an error page)
      if (buffer.length < 5000) {
        throw new Error('Response too small — likely an error from image service');
      }

      const caption =
        `🎨 *AI Image Generated!*\n\n` +
        `*Prompt:* ${prompt.length > 100 ? prompt.slice(0, 100) + '…' : prompt}\n` +
        `*Size:* ${w}×${h} · *Ratio:* ${ratio}\n\n` +
        `_Nova AI ⚡ | Powered by Pollinations_`;

      await sock.sendMessage(from, {
        image:   buffer,
        caption: caption,
        mimetype: 'image/jpeg',
      }, { quoted: msg });

    } catch (err) {
      console.error('[imagine]', err.message);
      await reply(
        '❌ Image generation failed this time.\n\n' +
        'Possible reasons:\n' +
        '  • The AI service is busy — try again in 30 seconds\n' +
        '  • Your prompt contained blocked content\n' +
        '  • Server internet is slow\n\n' +
        '_Tip: Keep prompts descriptive but not explicit_'
      );
    }
  },
};
