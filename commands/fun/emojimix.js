/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .emojimix — Combine two emojis for a fun result description
 * By Dev-Ntando
 */
'use strict';

const COMBOS = {
  '🔥❄️': '🌪️ A fire blizzard — unpredictable chaos energy!',
  '🐱🐶': '🐱‍🐉 A cat-dog hybrid — adorable but chaotic!',
  '🌙⭐': '✨ Starlit night — pure magic vibes!',
  '💀😂': '💀 Dead from laughing — you\'re DONE.',
  '🌊🔥': '🌋 Lava flow — unstoppable force!',
  '🍕🍔': '🍟 Fast food royalty — legendary combo!',
  '👑💎': '🏆 Diamond royalty — untouchable!',
  '🦁🐯': '🐆 King of all big cats — absolute unit!',
  '🌹💔': '🥀 A wilted love story — poetic pain.',
  '⚡🌙': '🌩️ Midnight storm energy — electrifying!',
};

module.exports = {
  name: 'emojimix',
  aliases: ['emix', 'mixemoji', 'emojiblend'],
  description: '🎨 Mix two emojis together for a fun result',
  category: 'fun',
  usage: '.emojimix 🔥 ❄️',

  execute: async ({ args, reply }) => {
    if (args.length < 2) {
      return reply(
        `🎨 *Emoji Mix*\n${'━'.repeat(28)}\n\n` +
        `Mix two emojis together!\n\n` +
        `*Usage:* .emojimix 🔥 ❄️\n\n` +
        `_Try combining any two emojis!_\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    const e1 = args[0].trim();
    const e2 = args[1].trim();
    const key1 = `${e1}${e2}`;
    const key2 = `${e2}${e1}`;

    const preset = COMBOS[key1] || COMBOS[key2];
    if (preset) {
      return reply(`🎨 *Emoji Mix Result*\n${'━'.repeat(28)}\n\n${e1} + ${e2} = ${preset}\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    }

    // Generate creative description from emoji codes
    const combos = [
      `${e1}${e2} — A legendary fusion of energy and vibes! The universe has never seen this before. 🌌`,
      `${e1}${e2} — These two forces collided and created something... unusual. We like it. ⚡`,
      `${e1}${e2} — Pure chaos in the best way. This combo shouldn't exist but here we are. 🔥`,
      `${e1}${e2} — A cosmic blend that only the chosen few can handle. Are you ready? 👑`,
      `${e1}${e2} — This mix radiates main character energy. You're the protagonist now. 🎭`,
    ];

    const result = combos[Math.floor(Math.random() * combos.length)];
    return reply(`🎨 *Emoji Mix Result*\n${'━'.repeat(28)}\n\n*${e1} + ${e2}*\n\n${result}\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
  },
};
