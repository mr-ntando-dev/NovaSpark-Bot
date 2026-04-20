/**
 * ⚡ NovaSpark Bot v5 — Mute / Unmute
 * Lock / unlock group so only admins can send messages
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'mute',
  aliases: ['lock', 'lockgroup'],
  category: 'group',
  description: 'Lock the group so only admins can speak',
  usage: '.mute',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      await sock.groupSettingUpdate(from, 'announcement');
      await reply('🔇 *Group locked.* Only admins can send messages now.');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
