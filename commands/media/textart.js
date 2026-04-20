/**
 * ⚡ NovaSpark v4 — Text Art / ASCII Art
 * .textart <style> <text>
 * Styles: bold, italic, bubble, square, fancy, flip, mirror, tiny
 * Generates styled Unicode text — works natively in WhatsApp.
 * NEVER seen as a proper command in MD bots.
 * By Dev-Ntando
 */
'use strict';

const maps = {
  bold: s => [...s].map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90)  return String.fromCodePoint(0x1D400 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + code - 97);
    if (code >= 48 && code <= 57)  return String.fromCodePoint(0x1D7CE + code - 48);
    return c;
  }).join(''),

  italic: s => [...s].map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90)  return String.fromCodePoint(0x1D434 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D44E + code - 97);
    return c;
  }).join(''),

  bubble: s => [...s].map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90)  return String.fromCodePoint(0x24B6 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
    if (code >= 48 && code <= 57)  return String.fromCodePoint(0x2460 + code - 49);
    return c;
  }).join(''),

  square: s => [...s].map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90)  return String.fromCodePoint(0x1F130 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F130 + code - 97);
    return c;
  }).join(''),

  flip: s => [...s].reverse().map(c => {
    const flips = { a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z' };
    return flips[c.toLowerCase()] || c;
  }).join(''),

  mirror: s => [...s].reverse().join(''),

  tiny: s => [...s.toLowerCase()].map(c => {
    const tiny = { a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',f:'ᶠ',g:'ᵍ',h:'ʰ',i:'ⁱ',j:'ʲ',k:'ᵏ',l:'ˡ',m:'ᵐ',n:'ⁿ',o:'ᵒ',p:'ᵖ',q:'ᑫ',r:'ʳ',s:'ˢ',t:'ᵗ',u:'ᵘ',v:'ᵛ',w:'ʷ',x:'ˣ',y:'ʸ',z:'ᶻ' };
    return tiny[c] || c;
  }).join(''),
};

module.exports = {
  name: 'textart',
  aliases: ['ta', 'style', 'fancy'],
  description: '✍️ Convert text to fancy Unicode styles for WhatsApp',
  category: 'media',

  execute: async ({ args, reply }) => {
    const style = (args[0] || '').toLowerCase();
    const text  = args.slice(1).join(' ');

    if (!maps[style] || !text) {
      const preview = Object.entries(maps)
        .map(([k, fn]) => `  *${k}:* ${fn('NovaSpark')}`)
        .join('\n');
      return reply(
        `✍️ *Text Art Styles*\n\n` +
        `Usage: \`.textart <style> <text>\`\n\n` +
        `Available styles:\n${preview}`
      );
    }

    return reply(`✍️ *${style.toUpperCase()}*\n\n${maps[style](text)}`);
  },
};
