/**
 * ⚡ NovaSpark v4 — Ship / Compatibility Score
 * .ship @user1 @user2 — Calculate love compatibility
 * Fun social command, never done this elaborately.
 * By Dev-Ntando
 */
'use strict';

const RESULTS = [
  { min: 90, emoji: '💍', msg: 'Soulmates! Get married already!' },
  { min: 75, emoji: '❤️‍🔥', msg: 'Super compatible! This is real!' },
  { min: 60, emoji: '💕', msg: 'Great match! Give it a shot.' },
  { min: 45, emoji: '🙃', msg: 'Not bad. Worth trying.' },
  { min: 25, emoji: '😬', msg: 'Hmm... maybe just friends.' },
  { min: 0,  emoji: '💔', msg: 'Disaster. Do not try this.' },
];

function djb2(str) {
  let h = 5381;
  for (const c of str) h = ((h << 5) + h) ^ c.charCodeAt(0);
  return Math.abs(h);
}

function score(a, b) {
  // Deterministic but looks random
  const seed = djb2(a + b) + djb2(b + a);
  return seed % 101;
}

function bar(pct) {
  const filled = Math.round(pct / 10);
  return '❤️'.repeat(filled) + '🖤'.repeat(10 - filled);
}

module.exports = {
  name: 'ship',
  aliases: ['love', 'couple', 'compat'],
  description: '💕 Calculate love compatibility between two people',
  category: 'social',

  execute: async ({ sock, msg, from, args, body, reply, mentions }) => {
    if (mentions?.length < 2) {
      return reply(
        '💕 *Ship Calculator*\n\n' +
        'Tag two people:\n`.ship @user1 @user2`\n\n' +
        '_Or tag one person to ship with yourself._'
      );
    }

    const [a, b] = mentions;
    const numA = a.split('@')[0];
    const numB = b.split('@')[0];
    const pct  = score(numA, numB);
    const res  = RESULTS.find(r => pct >= r.min);

    await sock.sendMessage(from, {
      text:
        `${res.emoji} *Ship Result*\n\n` +
        `👤 @${numA}\n❤️ + ❤️\n👤 @${numB}\n\n` +
        `${bar(pct)}\n\n` +
        `*Compatibility: ${pct}%*\n\n` +
        `${res.emoji} ${res.msg}\n\n` +
        `_⚡ NovaSpark Bot v4_`,
      mentions: [a, b],
    });
  },
};
