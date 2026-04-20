/**
 * ⚡ NovaSpark Bot v5 — Sticker to Image
 * Reply to a static sticker → PNG image
 * Reply to an animated sticker → MP4 GIF video
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

module.exports = {
  name: 'simage',
  aliases: ['toimg', 'sticker2img', 'simg', 'svideo'],
  category: 'general',
  description: 'Convert sticker to image/video',
  usage: '.simage (reply to sticker)',

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.quotedMessage?.stickerMessage) {
        return extra.reply('📎 Reply to a *sticker* to convert it to an image!');
      }

      const target = {
        key:     { remoteJid: extra.from, id: ctx.stanzaId, participant: ctx.participant },
        message: ctx.quotedMessage,
      };

      const buf = await downloadMediaMessage(target, 'buffer', {}, {
        logger: { info(){}, error(){}, warn(){}, debug(){} },
        reuploadRequest: sock.updateMediaMessage,
      });

      if (!buf) return extra.reply('❌ Failed to download sticker.');

      const isAnimated = ctx.quotedMessage.stickerMessage?.isAnimated;

      if (isAnimated) {
        // Animated WebP → send as video/gif
        await sock.sendMessage(extra.from, {
          video:    buf,
          mimetype: 'video/mp4',
          gifPlayback: true,
        }, { quoted: msg });
      } else {
        // Static WebP → PNG
        const png = await sharp(buf).png().toBuffer();
        await sock.sendMessage(extra.from, {
          image: png,
        }, { quoted: msg });
      }
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
