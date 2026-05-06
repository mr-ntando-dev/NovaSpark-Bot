/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .eval <code> — Execute arbitrary JS (Owner only — DANGEROUS)
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = {
  name: 'eval',
  aliases: ['exec', 'js', 'run'],
  description: '💻 Execute JavaScript code (Owner only)',
  category: 'owner',
  ownerOnly: true,

  execute: async ({ sock, from, msg, args, reply, sender }) => {
    const ownerNums = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
    const senderNum = sender.split('@')[0].split(':')[0];
    if (!ownerNums.map(String).includes(senderNum)) return reply('🚫 Owner only command.');

    const code = args.join(' ');
    if (!code) return reply('Usage: `.eval <javascript code>`');

    const start = Date.now();
    try {
      // eslint-disable-next-line no-eval
      let result = await eval(`(async () => { ${code} })()`);
      if (typeof result === 'object') result = JSON.stringify(result, null, 2);
      const elapsed = Date.now() - start;
      return reply(
        `💻 *Eval Result*\n${'━'.repeat(28)}\n\n` +
        `📥 Input:\n\`\`\`${code}\`\`\`\n\n` +
        `📤 Output:\n\`\`\`${String(result).slice(0, 3000)}\`\`\`\n\n` +
        `⏱️ ${elapsed}ms\n_⚡ NovaSpark Bot_`
      );
    } catch (e) {
      return reply(
        `💻 *Eval Error*\n${'━'.repeat(28)}\n\n` +
        `📥 Code:\n\`\`\`${code}\`\`\`\n\n` +
        `❌ Error:\n\`\`\`${e.message}\`\`\`\n_⚡ NovaSpark Bot_`
      );
    }
  },
};
