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

  async execute(sock, msg, args, extra) {
    try {
      await sock.groupSettingUpdate(extra.from, 'not_announcement');
      await extra.reply('🔊 *Group unlocked.* Everyone can send messages now.');
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
