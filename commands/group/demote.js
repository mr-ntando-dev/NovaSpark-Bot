/**
 * ⚡ NovaSpark Bot v5 — Demote
 * Remove admin rights from a group member
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'demote',
  aliases: ['removeadmin', 'da'],
  category: 'group',
  description: 'Remove admin rights from a member',
  usage: '.demote @user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      const ctx       = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      const target    = mentioned[0] || (ctx.stanzaId && ctx.participant ? ctx.participant : null);

      if (!target) return reply('❌ Mention or reply to the user you want to demote.\n\n_Example: .demote @user_');

      const meta = await sock.groupMetadata(from);
      const part = meta.participants.find(p => p.id === target || p.lid === target);

      if (!part)                                                return reply('❌ User not found in this group.');
      if (part.admin !== 'admin' && part.admin !== 'superadmin') return reply('❌ That user is not an admin!');

      await sock.groupParticipantsUpdate(from, [target], 'demote');
      await sock.sendMessage(from, {
        text: `⬇️ @${target.split('@')[0]} has been *demoted* from admin.`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
