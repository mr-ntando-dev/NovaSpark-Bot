/**
 * ⚡ NovaSpark Bot — URL Shortener
 * .short <url>  — shorten any URL using is.gd (no API key needed)
 * .unshort <url> — expand / follow a shortened URL to reveal destination
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'short',
  aliases: ['shorten', 'shorturl', 'tinyurl'],
  category: 'tools',
  description: 'Shorten any URL',
  usage: '.short <url> | .unshort <short_url>',

  async execute({ args, reply, body }) {
    const cmd = body.trim().split(' ')[0].replace(/^\./, '').toLowerCase();
    const url = args.join('').trim();
    if (!url) return reply('🔗 Usage:\n  `.short <url>` — shorten a URL\n  `.unshort <url>` — reveal where a short URL goes');

    if (cmd === 'unshort' || cmd === 'expand') {
      try {
        const res = await axios.get(url, {
          maxRedirects: 10,
          timeout: 10000,
          validateStatus: s => s < 500,
        });
        return reply(`🔗 *Expanded URL*\n\nShort: ${url}\nFull : \`${res.request.res.responseUrl || res.config.url}\``);
      } catch {
        return reply('❌ Could not expand that URL. It may be dead or unreachable.');
      }
    }

    // Shorten
    if (!url.startsWith('http')) return reply('❌ Please include http:// or https:// in the URL.');
    try {
      const { data } = await axios.get(
        `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`,
        { timeout: 8000 }
      );
      return reply(`✂️ *Shortened URL*\n\nOriginal : ${url}\nShort    : *${data}*`);
    } catch {
      return reply('❌ URL shortening failed. Try again!');
    }
  },
};
