/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .fortune — Fortune cookie message
 * By Dev-Ntando
 */
'use strict';

const FORTUNES = [
  'A beautiful friendship will soon blossom. 🌸',
  'Your hard work is about to pay off in ways you cannot imagine. 💫',
  'A pleasant surprise is waiting for you. 🎁',
  'The best is yet to come — stay patient and keep going. 🚀',
  'Success comes to those who hustle while others sleep. 😤',
  'A closed mouth gathers no foot. Think before you speak today. 🤐',
  'Your kindness will be repaid tenfold. 💛',
  'An important decision will present itself soon. Trust your gut. 🧭',
  'Adventure awaits just outside your comfort zone. 🌍',
  'You are the author of your destiny — pick up the pen. ✍️',
  'Something you lost will soon be found. 🔍',
  'Great things are happening behind the scenes in your life. 🎬',
  'A wise person knows when to act and when to wait. ⏳',
  'Your creativity will lead you somewhere unexpected and wonderful. 🎨',
  'Today\'s challenges are tomorrow\'s strengths. 💪',
  'A loyal friend is worth more than gold. Cherish them. 👫',
  'The universe is listening. Be careful what you wish for. 🌙',
  'Your next chapter begins at the moment you stop rereading the last one. 📖',
  'Fortune favours the bold. Make that move. ♟️',
  'You will laugh about this in a year. Trust the process. 😄',
  'Not all who wander are lost — some are just finding a shortcut. 🗺️',
  'Doors are opening for you that you haven\'t noticed yet. 🚪',
  'Someone is thinking about you right now. 💭',
  'A small act of courage today will change everything tomorrow. 🦋',
  'The richest person is not the one with the most, but the one who needs the least. 🌿',
];

const LUCKY_NUMBERS = () => Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1).join('  ');

module.exports = {
  name: 'fortune',
  aliases: ['fortunecookie', 'cookie', 'fc'],
  description: '🥠 Get a fortune cookie message with lucky numbers',
  category: 'fun',

  execute: async ({ reply }) => {
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    const lucky   = LUCKY_NUMBERS();

    return reply(
      `🥠 *Fortune Cookie*\n${'━'.repeat(28)}\n\n` +
      `_"${fortune}"_\n\n` +
      `🍀 *Lucky Numbers:* ${lucky}\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
