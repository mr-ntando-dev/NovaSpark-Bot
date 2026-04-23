/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .couple @user1 @user2 — Generate a couple name and compatibility score
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'couple',
  aliases: ['couplename', 'lovename'],
  description: '💑 Mash two names into a couple name + score',
  category: 'fun',

  execute: async ({ sock, from, msg, args, reply, mentions }) => {
    if (!mentions || mentions.length < 2)
      return reply('Usage: `.couple @person1 @person2`');

    const [a, b]   = mentions;
    const numA     = a.split('@')[0];
    const numB     = b.split('@')[0];
    const combined = (numA + numB).toLowerCase();
    const score    = Math.floor(50 + (Math.abs(hashCode(combined)) % 51));
    const half1    = numA.slice(0, Math.ceil(numA.length / 2));
    const half2    = numB.slice(Math.floor(numB.length / 2));
    const cName    = (half1 + half2).toUpperCase();

    const hearts = score >= 80 ? '❤️❤️❤️' : score >= 60 ? '💛💛' : '🤍';
    const vibe   = score >= 85 ? 'Soulmates 😍' : score >= 70 ? 'Strong Couple 💪' : score >= 55 ? 'Compatible 🙂' : 'Work In Progress 🤞';

    await sock.sendMessage(from, {
      text:
        `💑 *Couple Match*\n${'━'.repeat(28)}\n\n` +
        `👤 @${numA} + @${numB}\n` +
        `💞 Couple Name: *${cName}*\n\n` +
        `${hearts} *${score}% Compatible*\n` +
        `Status: _${vibe}_\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`,
      mentions: [a, b],
    }, { quoted: msg });
  },
};

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}
