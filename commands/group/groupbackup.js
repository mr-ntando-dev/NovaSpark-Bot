/**
 * ⚡ NovaSpark Bot v7 — Group Backup
 * Save current group member list + settings to owner DM
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

module.exports = {
  name: 'groupbackup',
  aliases: ['backupgroup', 'gbackup'],
  category: 'group',
  description: 'Backup group member list and settings to owner DM',
  usage: '.groupbackup',
  groupOnly: true,
  adminOnly: true,

  async execute({ sock, msg, from, reply, groupMeta }) {
    try {
      await reply('⏳ Creating group backup...');

      const meta     = groupMeta || await sock.groupMetadata(from).catch(() => null);
      const members  = meta?.participants || [];
      const admins   = members.filter(m => m.admin).map(m => `+${m.id.split('@')[0]} (${m.admin})`);
      const regular  = members.filter(m => !m.admin).map(m => `+${m.id.split('@')[0]}`);
      const settings = database.getGroupSettings ? database.getGroupSettings(from) : {};

      const now = new Date().toLocaleString('en-ZA', { timeZone: config.timezone || 'Africa/Harare' });

      const backupText =
        `📋 *Group Backup — NovaSpark*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🏷️ Name    : ${meta?.subject || 'Unknown'}\n` +
        `👥 Members : ${members.length}\n` +
        `🕐 Time    : ${now}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `👑 *Admins (${admins.length}):*\n${admins.join('\n') || 'None'}\n\n` +
        `👤 *Members (${regular.length}):*\n${regular.join('\n') || 'None'}\n\n` +
        `⚙️ *Settings:*\n` +
        Object.entries(settings)
          .map(([k, v]) => `• ${k}: ${JSON.stringify(v)}`)
          .join('\n') +
        `\n\n_Backup by NovaSpark Bot_`;

      // Send to owner
      const ownerJid = `${config.ownerNumber[0]}@s.whatsapp.net`;
      try {
        await sock.sendMessage(ownerJid, { text: backupText });
      } catch {}

      await reply(`✅ *Backup complete!*\n\n👥 ${members.length} members backed up.\n📤 Sent to owner DM.`);
    } catch (e) {
      await reply(`❌ Backup failed: ${e.message}`);
    }
  },
};
