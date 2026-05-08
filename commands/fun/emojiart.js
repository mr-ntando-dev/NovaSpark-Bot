/**
 * ⚡ NovaSpark Bot — Emoji Art Generator
 * .emojiart <word>  — converts text to emoji art
 * By Dev-Ntando
 */
'use strict';

const EMOJI_ALPHABET = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
  '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
  '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
  ' ': '  ',
};

const BUBBLE_ALPHABET = {
  a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ',
  h: 'ⓗ', i: 'ⓘ', j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ',
  o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ', u: 'ⓤ',
  v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ', ' ': '  ',
};

const SQUARE_ALPHABET = {
  a: '🄰', b: '🄱', c: '🄲', d: '🄳', e: '🄴', f: '🄵', g: '🄶',
  h: '🄷', i: '🄸', j: '🄹', k: '🄺', l: '🄻', m: '🄼', n: '🄽',
  o: '🄾', p: '🄿', q: '🅀', r: '🅁', s: '🅂', t: '🅃', u: '🅄',
  v: '🅅', w: '🅆', x: '🅇', y: '🅈', z: '🅉', ' ': '  ',
};

function convert(text, map) {
  return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

module.exports = {
  name: 'emojiart',
  aliases: ['etext', 'fancytext', 'textart2'],
  category: 'fun',
  description: 'Convert text into fancy emoji art styles',
  usage: '.emojiart <text>  |  .emojiart bubble <text>  |  .emojiart square <text>',

  async execute({ args, reply }) {
    const style  = ['bubble', 'square', 'block'].includes(args[0]?.toLowerCase()) ? args[0].toLowerCase() : null;
    const text   = style ? args.slice(1).join(' ').trim() : args.join(' ').trim();

    if (!text) {
      return reply(
        '🎨 *Emoji Art*\n\n' +
        'Usage:\n' +
        '  `.emojiart <text>` — block style\n' +
        '  `.emojiart bubble <text>` — bubble style\n' +
        '  `.emojiart square <text>` — square style\n\n' +
        'Example: `.emojiart NOVA`'
      );
    }

    if (text.length > 20) {
      return reply('❌ Text too long. Maximum 20 characters.');
    }

    const block  = convert(text, EMOJI_ALPHABET);
    const bubble = convert(text, BUBBLE_ALPHABET);
    const square = convert(text, SQUARE_ALPHABET);

    if (style === 'bubble') return reply(`🫧 *Bubble Style*\n\n${bubble}`);
    if (style === 'square') return reply(`🔲 *Square Style*\n\n${square}`);

    return reply(
      `🎨 *Emoji Art for "${text}"*\n\n` +
      `🅰️ Block:\n${block}\n\n` +
      `🫧 Bubble:\n${bubble}\n\n` +
      `🔲 Square:\n${square}`
    );
  },
};
