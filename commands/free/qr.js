/**
 * NovaSpark Bot v3 — QR Code Generator
 * .qr <text/url>  — generates a real, scannable QR code and sends it as image
 * By Dev-Ntando
 */
'use strict';

const QRCode   = require('qrcode');
const database = require('../../database');

module.exports = {
  name: 'qr',
  aliases: ['qrcode', 'makeqr'],
  description: 'Generate a scannable QR code for any text or URL',
  category: 'free',

  execute: async ({ sock, from, sender, args, msg, reply }) => {
    database.logCommand(sender, 'qr');

    const text = args.join(' ').trim();
    if (!text) {
      return reply(
        '📲 *QR Code Generator*\n\n' +
        'Usage: *.qr <text or URL>*\n\n' +
        'Examples:\n' +
        '  .qr https://github.com/dev-modder/NovaSpark-Bot\n' +
        '  .qr Hello, I am Dev-Ntando!\n' +
        '  .qr +263786831091'
      );
    }

    await sock.sendPresenceUpdate('composing', from);

    try {
      // Generate QR as PNG buffer — high error correction for good scan rate
      const pngBuffer = await QRCode.toBuffer(text, {
        type:            'png',
        width:           512,
        margin:          2,
        errorCorrectionLevel: 'H',
        color: {
          dark:  '#1a1a2e',   // dark navy squares
          light: '#ffffff',
        },
      });

      const caption =
        `📲 *QR Code Generated!*\n\n` +
        `*Content:* ${text.length > 80 ? text.slice(0, 80) + '…' : text}\n\n` +
        `_Scan with any QR reader or WhatsApp camera_\n_Nova AI ⚡_`;

      await sock.sendMessage(from, {
        image:   pngBuffer,
        caption: caption,
        mimetype: 'image/png',
      }, { quoted: msg });

    } catch (err) {
      console.error('[qr]', err.message);
      if (err.message?.includes('too long')) {
        return reply('❌ Text is too long for a QR code. Max ~1000 characters.');
      }
      await reply('❌ Could not generate QR code. Try again.');
    }
  },
};
