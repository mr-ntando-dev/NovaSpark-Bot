/**
 * ⚡ NovaSpark Bot v5 — Delete
 * Bot deletes a replied-to message
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'delete',
  aliases: ['del', 'clear'],
  category: 'group',
  description: 'Delete a replied-to message',
  usage: '.delete (reply to message)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.stanzaId) return extra.reply('❌ Reply to the message you want to delete.');

      await sock.sendMessage(extra.from, {
        delete: {
          remoteJid:   extra.from,
          id:          ctx.stanzaId,
          participant: ctx.participant,
          fromMe:      false,
        },
      });
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
