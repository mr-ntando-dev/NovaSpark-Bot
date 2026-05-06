/**
 * ⚡ NovaSpark Bot v5 — Unmute
 * Unlock group so everyone can send messages again
 * By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'unmute',
  aliases: ['unlock', 'unlockgroup'],
  category: 'group',
  description: 'Unlock the group so everyone can speak',
  usage: '.unmute',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      await sock.groupSettingUpdate(from, 'not_announcement');
      await reply('🔊 *Group unlocked.* Everyone can send messages now.');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
