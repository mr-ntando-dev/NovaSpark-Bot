/**
 * ⚡ NovaSpark Bot — Color Info (FREE, no API)
 * .colorinfo #ff6600   — details about a hex color
 * .colorinfo rgb 255 102 0
 * .colorinfo random    — random color with details
 */
'use strict';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full  = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function colorName(r, g, b) {
  // Very basic heuristic color naming
  const h = rgbToHsl(r, g, b);
  if (r > 200 && g < 80 && b < 80) return 'Red';
  if (r > 200 && g > 100 && b < 50) return 'Orange';
  if (r > 200 && g > 200 && b < 80) return 'Yellow';
  if (r < 80 && g > 150 && b < 80) return 'Green';
  if (r < 80 && g < 80 && b > 180) return 'Blue';
  if (r > 80 && g < 80 && b > 180) return 'Purple';
  if (r > 180 && g < 80 && b > 180) return 'Magenta';
  if (r < 50 && g < 50 && b < 50) return 'Black';
  if (r > 200 && g > 200 && b > 200) return 'White';
  if (r > 120 && g > 120 && b > 120 && Math.abs(r-g)<20 && Math.abs(g-b)<20) return 'Gray';
  if (h.s < 15) return 'Gray';
  return 'Mixed';
}

function randByte() { return Math.floor(Math.random() * 256); }

module.exports = {
  name:    'colorinfo',
  aliases: ['colourinfo', 'hexcolor', 'colordetail'],
  category: 'tools',
  desc:    'Get details about any color (HEX, RGB, HSL)',
  usage:   '.colorinfo #FF6600 | .colorinfo rgb 255 102 0 | .colorinfo random',
  example: '.colorinfo #a855f7\n.colorinfo rgb 168 85 247\n.colorinfo random',
  async execute({ sock, msg, args, from }) {
    let r, g, b;

    if (!args.length || args[0].toLowerCase() === 'random') {
      r = randByte(); g = randByte(); b = randByte();
    } else if (args[0].toLowerCase() === 'rgb') {
      r = parseInt(args[1]); g = parseInt(args[2]); b = parseInt(args[3]);
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return sock.sendMessage(from, { text: '❌ Usage: `.colorinfo rgb 255 102 0`' }, { quoted: msg });
      }
    } else {
      const hex = args[0].replace(/[^0-9a-fA-F#]/g, '');
      if (!/^#?[0-9a-fA-F]{3,6}$/.test(hex)) {
        return sock.sendMessage(from, { text: '❌ Invalid hex color. Example: `.colorinfo #FF6600`' }, { quoted: msg });
      }
      ({ r, g, b } = hexToRgb(hex));
    }

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const name = colorName(r, g, b);
    // Luminance for text contrast hint
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const contrast = lum > 0.5 ? 'Dark text on this bg' : 'Light text on this bg';

    await sock.sendMessage(from, {
      text: `🎨 *Color Info*\n\n` +
            `🔷 *Name:* ${name}\n` +
            `🔹 *HEX:* ${hex}\n` +
            `🔹 *RGB:* rgb(${r}, ${g}, ${b})\n` +
            `🔹 *HSL:* hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)\n\n` +
            `💡 *Tip:* ${contrast}\n` +
            `🌓 *Luminance:* ${Math.round(lum * 100)}%\n\n` +
            `_Powered by NovaSpark Bot v11_`,
    }, { quoted: msg });
  },
};
