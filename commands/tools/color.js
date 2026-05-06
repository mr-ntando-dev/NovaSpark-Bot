/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .color <hex|rgb|name> — Color info and conversions
 * By Dev-Ntando
 */
'use strict';

const NAMED = {
  red: '#FF0000', green: '#008000', blue: '#0000FF', yellow: '#FFFF00',
  white: '#FFFFFF', black: '#000000', orange: '#FFA500', purple: '#800080',
  pink: '#FFC0CB', cyan: '#00FFFF', magenta: '#FF00FF', brown: '#A52A2A',
  gold: '#FFD700', silver: '#C0C0C0', navy: '#000080', lime: '#00FF00',
  teal: '#008080', maroon: '#800000', coral: '#FF7F50', crimson: '#DC143C',
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
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
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

module.exports = {
  name: 'color',
  aliases: ['colour', 'colorinfo', 'hex'],
  description: '🎨 Get color info and conversions (HEX/RGB/HSL)',
  category: 'tools',

  execute: async ({ args, reply }) => {
    if (!args.length) return reply('Usage: `.color #FF5733` or `.color 255 87 51` or `.color red`');

    let hex;
    const input = args.join(' ').toLowerCase().trim();

    if (NAMED[input]) {
      hex = NAMED[input];
    } else if (/^#?[0-9a-f]{6}$/i.test(input)) {
      hex = input.startsWith('#') ? input : '#' + input;
    } else if (args.length === 3 && args.every(a => !isNaN(a))) {
      const [r, g, b] = args.map(Number);
      if ([r, g, b].some(v => v < 0 || v > 255)) return reply('❌ RGB values must be 0–255.');
      hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    } else {
      return reply('❌ Invalid color. Try: `.color #FF5733`, `.color 255 87 51`, or `.color red`');
    }

    hex = hex.toUpperCase();
    const { r, g, b } = hexToRgb(hex.toLowerCase());
    const { h, s, l } = rgbToHsl(r, g, b);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const preview    = brightness > 128 ? '☀️ Light' : '🌙 Dark';

    const swatch = ['⬛', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬜'];

    return reply(
      `🎨 *Color Info*\n${'━'.repeat(28)}\n\n` +
      `🔵 HEX: \`${hex}\`\n` +
      `🔴 RGB: \`rgb(${r}, ${g}, ${b})\`\n` +
      `🟡 HSL: \`hsl(${h}, ${s}%, ${l}%)\`\n` +
      `💡 Brightness: ${preview}\n` +
      `🌓 Luminance: ${Math.round(brightness)}/255\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
