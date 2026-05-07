/**
 * ⚡ NovaSpark Bot v5 — Coin Flip
 * Flips a coin — heads or tails
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'flip',
  aliases: ['flipcoin', 'headstails', 'fliptoss'],
  category: 'fun',
  description: 'Flip a coin — heads or tails',
  usage: '.flip',

  async execute({ reply }) {
    const result = Math.random() < 0.5 ? 'HEADS 🪙' : 'TAILS 🔄';
    const lines = [
      '🪙 *Coin Flip!*',
      '━'.repeat(24),
      '',
      `Result: *${result}*`,
      '',
      '_The coin never lies... probably._',
    ];
    await reply(lines.join('\n'));
  },
};
