/**
 * ⚡ NovaSpark Bot v5 — Dice Roll
 * Rolls one or multiple dice with configurable sides
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'dice',
  aliases: ['roll', 'rolldice', 'd6'],
  category: 'fun',
  description: 'Roll dice. Usage: .dice [count] [sides]',
  usage: '.dice | .dice 2 | .dice 3 20',

  async execute({ args, reply }) {
    const count = Math.min(parseInt(args[0]) || 1, 10);
    const sides = Math.min(Math.max(parseInt(args[1]) || 6, 2), 100);

    const faces = { 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣' };
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);

    const rollStr = rolls.map(r => sides === 6 && faces[r] ? faces[r] : `[${r}]`).join('  ');

    const lines = [
      `🎲 *Dice Roll — ${count}d${sides}*`,
      '━'.repeat(24),
      '',
      rollStr,
      '',
      count > 1 ? `Total: *${total}*` : `Result: *${total}*`,
    ];
    await reply(lines.join('\n'));
  },
};
