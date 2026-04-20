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

  async execute(sock, msg, args, extra) {
    try {
      await sock.groupSettingUpdate(extra.from, 'announcement');
      await extra.reply('🔇 *Group locked.* Only admins can send messages now.');
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
