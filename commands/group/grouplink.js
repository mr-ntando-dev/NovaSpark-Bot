/**
 * ⚡ NovaSpark Bot v5 — GroupLink
 * Fetch the current group invite link
 * By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'grouplink',
  aliases: ['invitelink', 'link'],
  category: 'group',
  description: 'Get the current group invite link',
  usage: '.grouplink',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      const code = await sock.groupInviteCode(from);
      await reply(
        `🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}\n\n_Use .resetlink to revoke and generate a new link._`
      );
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
