/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .confess <message> — Send an anonymous confession to the group
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'confess',
  aliases: ['anonymous', 'anon'],
  description: '🎭 Send an anonymous confession to the group',
  category: 'fun',

  execute: async ({ sock, from, msg, args, reply, isGroup }) => {
    if (!isGroup) return reply('❌ This command only works in groups.');
    const text = args.join(' ');
    if (!text) return reply('Usage: `.confess <your confession>`\n_Your identity stays hidden._');

    await sock.sendMessage(from, {
      text:
        `🎭 *Anonymous Confession*\n` +
        `${'━'.repeat(30)}\n\n` +
        `"${text}"\n\n` +
        `_— Sent anonymously via NovaSpark Bot_`,
    });
  },
};
