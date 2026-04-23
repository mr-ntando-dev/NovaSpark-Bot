/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .rate <anything> — Rate anything out of 10 with AI-style commentary
 * By Dev-Ntando
 */
'use strict';

const COMMENTS = [
  'Absolute peak. Frame it.',
  'Pretty solid, ngl.',
  'Mid at best. Could do better.',
  'Below average. Try again.',
  'Legendary. 10/10 would recommend.',
  'Meh. Exists, I guess.',
  'God tier. Never doubt it.',
  'Trash. Respectfully.',
  'Hidden gem. Most people sleep on this.',
  'It\'s giving chaos. Chaotically good though.',
  'Certified classic.',
  'Overhyped. Controversial but I said what I said.',
  'Better than expected. Pleasantly surprised.',
  'The villain arc is real.',
  'Main character energy.',
];

module.exports = {
  name: 'rate',
  aliases: ['rateme', 'howgood', 'score'],
  description: '⭐ Rate anything out of 10',
  category: 'fun',

  execute: async ({ args, reply, sender }) => {
    const subject = args.join(' ') || `+${sender.split('@')[0]}`;
    const score   = (Math.abs(hashCode(subject + Date.now().toString().slice(0, -3))) % 11);
    const stars   = '⭐'.repeat(score) + '☆'.repeat(10 - score);
    const comment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];

    return reply(
      `⭐ *NovaSpark Rating*\n${'━'.repeat(28)}\n\n` +
      `📌 *"${subject}"*\n\n` +
      `${stars}\n` +
      `*Score: ${score}/10*\n\n` +
      `💬 _"${comment}"_\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}
