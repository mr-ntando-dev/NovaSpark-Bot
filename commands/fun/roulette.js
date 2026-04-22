/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .roulette — Russian roulette game (fun/harmless)
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'roulette',
  aliases: ['russianroulette', 'spin'],
  description: 'Play Russian roulette — 1 in 6 chance',
  category: 'fun',

  execute: async ({ reply, sender }) => {
    const num    = sender.split('@')[0];
    const bullet = Math.floor(Math.random() * 6) === 0; // 1 in 6

    if (bullet) {
      return reply(
        `🔫 *BANG!*\n\n` +
        `💀 +${num} pulled the trigger and... the bullet was there.\n` +
        `_Better luck next round... if there is one. 💀_\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    } else {
      return reply(
        `🔫 *Click...*\n\n` +
        `😅 +${num} pulled the trigger and survived! *Empty chamber.*\n` +
        `_You live to spin again. 🍀_\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }
  },
};
