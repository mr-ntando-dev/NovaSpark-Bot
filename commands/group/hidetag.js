/**
 * ⚡ NovaSpark Bot v5 — HideTag
 * Silently mention all members — great for announcements without noise
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'hidetag',
  aliases: ['htag', 'stag', 'silent'],
  category: 'group',
  description: 'Silently tag all group members',
  usage: '.hidetag [message] (or reply to media)',
  groupOnly: true,
  adminOnly: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      const meta      = await sock.groupMetadata(from);
      const mentions  = meta.participants.map(p => p.id);
      const ctx       = msg.message?.extendedTextMessage?.contextInfo;
      const text      = args.join(' ') || '';

      // If replying to media, forward it with hidden mentions
      if (ctx?.quotedMessage) {
        const quoted = {
          key:     { remoteJid: from, id: ctx.stanzaId, participant: ctx.participant },
          message: ctx.quotedMessage,
        };
        const mediaMsg =
          quoted.message?.imageMessage ||
          quoted.message?.videoMessage ||
          quoted.message?.stickerMessage;

        if (mediaMsg) {
          const buf = await downloadMediaMessage(quoted, 'buffer', {}, {
            logger: { info(){}, error(){}, warn(){}, debug(){} },
            reuploadRequest: sock.updateMediaMessage,
          });

          if (quoted.message?.imageMessage) {
            await sock.sendMessage(from, { image: buf, caption: text || quoted.message.imageMessage.caption || '', mentions }, { quoted: msg });
          } else if (quoted.message?.videoMessage) {
            await sock.sendMessage(from, { video: buf, caption: text || quoted.message.videoMessage.caption || '', mentions }, { quoted: msg });
          } else {
            await sock.sendMessage(from, { sticker: buf, mentions }, { quoted: msg });
          }
          return;
        }
      }

      // Plain text hidden tag
      await sock.sendMessage(from, {
        text: text || '📌',
        mentions,
      }, { quoted: msg });
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
