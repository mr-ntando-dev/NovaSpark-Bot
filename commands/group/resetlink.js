/**
 * ⚡ NovaSpark Bot v5 — ResetLink
 * Revoke and regenerate the group invite link
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'resetlink',
  aliases: ['revokelink', 'newlink'],
  category: 'group',
  description: 'Reset/revoke the group invite link',
  usage: '.resetlink',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      const code = await sock.groupRevokeInvite(from);
      await reply(
        `🔄 *Group link has been reset!*\n\n` +
        `New link:\nhttps://chat.whatsapp.com/${code}`
      );
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
