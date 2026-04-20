/**
 * ⚡ NovaSpark Bot v5 — TagAll
 * Mention every member in the group
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'tagall',
  aliases: ['mentionall', 'everyone', '@all'],
  category: 'group',
  description: 'Tag all group members',
  usage: '.tagall [message]',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const meta         = await sock.groupMetadata(extra.from);
      const participants = meta.participants.map(p => p.id);
      const message      = args.join(' ') || '📢 Attention everyone!';

      let text = `📢 *${meta.subject || 'Group Announcement'}*\n\n${message}\n\n`;
      participants.forEach((id, i) => {
        text += `${i + 1}. @${id.split('@')[0]}\n`;
      });

      await sock.sendMessage(extra.from, { text, mentions: participants }, { quoted: msg });
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
