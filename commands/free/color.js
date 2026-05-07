/**
 * ⚡ NovaSpark Bot v5 — Color Info
 * Look up color info: hex → RGB → HSL → name
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function randomHex() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
}

module.exports = {
  name: 'colorfree',
  aliases: ['colourfree', 'hexfree', 'colorinfofree'],
  category: 'free',
  description: 'Get color info from a HEX code. Usage: .color #FF5733 or .color random',
  usage: '.color #FF5733 | .color random',

  async execute({ args, reply }) {
    let hex;
    if (!args[0] || args[0].toLowerCase() === 'random') {
      hex = randomHex();
    } else {
      hex = args[0].startsWith('#') ? args[0].toUpperCase() : '#' + args[0].toUpperCase();
    }

    // Validate
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      return reply(`❌ Invalid HEX: *${hex}*\n\nUse format: #RRGGBB (e.g. #FF5733)\nOr: *.color random*`);
    }

    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);

    let name = null;
    try {
      const { data } = await axios.get(
        `https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}&format=json`,
        { timeout: 5000 }
      );
      name = data?.name?.value || null;
    } catch { /* no name — fine */ }

    // Luminance-based label
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const brightness = luminance > 180 ? '☀️ Light' : luminance > 80 ? '🌤️ Mid' : '🌙 Dark';

    const lines = [
      `🎨 *Color Info*`,
      '━'.repeat(28),
      '',
      name ? `🏷️ Name:       *${name}*` : '',
      `🔵 HEX:        \`${hex}\``,
      `🔴 RGB:        rgb(${r}, ${g}, ${b})`,
      `🌈 HSL:        hsl(${h}°, ${s}%, ${l}%)`,
      `💡 Brightness: ${brightness}`,
      '',
      `_Preview → https://www.colorhexa.com/${hex.replace('#', '')}_`,
    ].filter(Boolean);

    await reply(lines.join('\n'));
  },
};
