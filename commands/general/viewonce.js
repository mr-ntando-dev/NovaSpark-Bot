/**
 * ⚡ NovaSpark Bot v5 — ViewOnce Revealer (VV)
 * Reveals view-once images, videos, and audio
 * Supports viewOnceMessageV2Extension, V2, classic, and direct viewOnce flags
 * Ported & improved from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'viewonce',
  aliases: ['vv', 'readvo', 'readviewonce', 'reveal'],
  category: 'general',
  description: 'Reveal a view-once image/video/audio',
  usage: '.vv (reply to a view-once message)',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;

    const ctx =
      msg.message?.extendedTextMessage?.contextInfo ||
      msg.message?.imageMessage?.contextInfo ||
      msg.message?.videoMessage?.contextInfo ||
      msg.message?.buttonsResponseMessage?.contextInfo ||
      msg.message?.listResponseMessage?.contextInfo;

    if (!ctx?.quotedMessage || !ctx?.stanzaId) {
      return extra.reply('👁️ Reply to a *view-once* message to reveal it!\n\n_Usage: .vv_');
    }

    const quoted = ctx.quotedMessage;

    const hasViewOnce =
      !!quoted.viewOnceMessageV2 ||
      !!quoted.viewOnceMessageV2Extension ||
      !!quoted.viewOnceMessage ||
      !!quoted.viewOnce ||
      !!quoted?.imageMessage?.viewOnce ||
      !!quoted?.videoMessage?.viewOnce ||
      !!quoted?.audioMessage?.viewOnce;

    if (!hasViewOnce) {
      return extra.reply('❌ That is not a view-once message!');
    }

    let actualMsg = null;
    let mtype     = null;

    if (quoted.viewOnceMessageV2Extension?.message) {
      actualMsg = quoted.viewOnceMessageV2Extension.message;
      mtype     = Object.keys(actualMsg)[0];
    } else if (quoted.viewOnceMessageV2?.message) {
      actualMsg = quoted.viewOnceMessageV2.message;
      mtype     = Object.keys(actualMsg)[0];
    } else if (quoted.viewOnceMessage?.message) {
      actualMsg = quoted.viewOnceMessage.message;
      mtype     = Object.keys(actualMsg)[0];
    } else if (quoted.imageMessage?.viewOnce) {
      actualMsg = { imageMessage: quoted.imageMessage };
      mtype     = 'imageMessage';
    } else if (quoted.videoMessage?.viewOnce) {
      actualMsg = { videoMessage: quoted.videoMessage };
      mtype     = 'videoMessage';
    } else if (quoted.audioMessage?.viewOnce) {
      actualMsg = { audioMessage: quoted.audioMessage };
      mtype     = 'audioMessage';
    }

    if (!actualMsg || !mtype) {
      return extra.reply('❌ Unsupported view-once message format.');
    }

    const downloadType = mtype === 'imageMessage' ? 'image' : mtype === 'videoMessage' ? 'video' : 'audio';

    try {
      await extra.reply('👁️ Revealing view-once...');

      const stream = await downloadContentFromMessage(actualMsg[mtype], downloadType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      if (mtype === 'imageMessage') {
        await sock.sendMessage(chatId, {
          image:   buffer,
          caption: `👁️ *View-Once Revealed*\n_⚡ NovaSpark Bot_`,
        }, { quoted: msg });
      } else if (mtype === 'videoMessage') {
        await sock.sendMessage(chatId, {
          video:    buffer,
          mimetype: 'video/mp4',
          caption:  `👁️ *View-Once Revealed*\n_⚡ NovaSpark Bot_`,
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, {
          audio:    buffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt:      true,
        }, { quoted: msg });
      }
    } catch (e) {
      await extra.reply(`❌ Failed to reveal: ${e.message}`);
    }
  },
};
