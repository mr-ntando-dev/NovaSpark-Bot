/**
 * ⚡ NovaSpark Bot v5 — Promote
 * Promote a group member to admin
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'promote',
  aliases: ['makeadmin', 'pa'],
  category: 'group',
  description: 'Promote a member to group admin',
  usage: '.promote @user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const ctx       = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      const target    = mentioned[0] || (ctx.stanzaId && ctx.participant ? ctx.participant : null);

      if (!target) return extra.reply('❌ Mention or reply to the user you want to promote.\n\n_Example: .promote @user_');

      const meta = await sock.groupMetadata(extra.from);
      const part = meta.participants.find(p => p.id === target || p.lid === target);

      if (!part)                                             return extra.reply('❌ User not found in this group.');
      if (part.admin === 'admin' || part.admin === 'superadmin') return extra.reply('❌ That user is already an admin!');

      await sock.groupParticipantsUpdate(extra.from, [target], 'promote');
      await sock.sendMessage(extra.from, {
        text: `✅ @${target.split('@')[0]} is now a *Group Admin*! 🛡️`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
