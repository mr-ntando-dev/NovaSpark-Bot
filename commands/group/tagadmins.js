/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .tagadmins [msg] — Mention all group admins
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'tagadmins',
  aliases: ['mentionadmins', 'admins'],
  description: 'Mention all admins in the group',
  category: 'group',

  execute: async ({ sock, msg, from, args, reply }) => {
    try {
      const meta    = await sock.groupMetadata(from);
      const admins  = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

      if (!admins.length) return reply('⚠️ No admins found in this group.');

      const mentions = admins.map(a => a.id);
      const message  = args.join(' ') || '📢 Attention admins!';
      const text     = `${message}\n\n` + admins.map(a => `@${a.id.split('@')[0]}`).join('\n');

      await sock.sendMessage(from, { text, mentions }, { quoted: msg });
    } catch {
      return reply('❌ Failed to tag admins. Bot may need admin access.');
    }
  },
};
