/**
 * ⚡ NovaSpark Bot — Random Color Generator
 * .randomcolor  — generates a random color with HEX, RGB, and HSL values
 * By Dev-Ntando
 */
'use strict';

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
  if (max === min) {
    h = s = 0;
  } else {
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

const COLOR_NAMES = [
  'Crimson', 'Coral', 'Tomato', 'Salmon', 'Orchid', 'Violet', 'Indigo',
  'Teal', 'Aquamarine', 'Chartreuse', 'Gold', 'Khaki', 'Sienna', 'Maroon',
  'Navy', 'Olive', 'Lime', 'Azure', 'Lavender', 'Magenta', 'Cyan', 'Amber',
];

module.exports = {
  name: 'randomcolor',
  aliases: ['rcolor', 'colorgen', 'colour'],
  category: 'tools',
  description: 'Generate a random color with HEX, RGB, HSL values',
  usage: '.randomcolor',

  async execute({ reply }) {
    const hex = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    const name = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];

    return reply(
      `🎨 *Random Color*\n\n` +
      `🏷️  Name  : *${name}*\n` +
      `#️⃣  HEX   : *${hex}*\n` +
      `🔴  RGB   : *rgb(${r}, ${g}, ${b})*\n` +
      `🌈  HSL   : *hsl(${h}, ${s}%, ${l}%)*\n\n` +
      `_Preview: https://www.colorhexa.com/${hex.slice(1).toLowerCase()}_`
    );
  },
};
