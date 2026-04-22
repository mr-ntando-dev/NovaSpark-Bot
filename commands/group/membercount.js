/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .membercount — Show group member count breakdown
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'membercount',
  aliases: ['members', 'memcount'],
  description: 'Show total members and admin count in the group',
  category: 'group',

  execute: async ({ sock, msg, from, reply }) => {
    try {
      const meta    = await sock.groupMetadata(from);
      const all     = meta.participants;
      const admins  = all.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
      const regular = all.length - admins.length;

      return reply(
        `👥 *Member Count — ${meta.subject}*\n` +
        `${'━'.repeat(28)}\n\n` +
        `👥 *Total Members:* ${all.length}\n` +
        `👑 *Admins:* ${admins.length}\n` +
        `👤 *Regular Members:* ${regular}\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    } catch {
      return reply('❌ Failed to fetch group info. This command only works in groups.');
    }
  },
};
