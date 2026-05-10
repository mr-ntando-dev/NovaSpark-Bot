/**
 * ⚡ NovaSpark Bot — QR Code Generator (FREE, no API)
 * .qrgen <text or URL>  → generates a real QR code image and sends it
 */
'use strict';

const QRCode = require('qrcode');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');

module.exports = {
  name:    'qrgen',
  aliases: ['makeqr', 'createqr', 'qrcreate'],
  category: 'tools',
  desc:    'Generate a QR code for any text or URL',
  usage:   '.qrgen <text or URL>',
  example: '.qrgen https://github.com/mr-ntando-dev/NovaSpark-Bot',
  async execute({ sock, msg, args, from }) {
    const text = args.join(' ').trim();
    if (!text) {
      return sock.sendMessage(from, {
        text: '❌ Usage: `.qrgen <text or URL>`\nExample: `.qrgen https://example.com`',
      }, { quoted: msg });
    }

    const tmpFile = path.join(os.tmpdir(), `ns_qr_${Date.now()}.png`);
    try {
      await QRCode.toFile(tmpFile, text, {
        type: 'png',
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });

      const imgBuf = fs.readFileSync(tmpFile);
      await sock.sendMessage(from, {
        image: imgBuf,
        caption: `📷 *QR Code Generated!*\n\n> ${text}\n\n_Powered by NovaSpark Bot v11_`,
        mimetype: 'image/png',
      }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, {
        text: `❌ Failed to generate QR code: ${e.message}`,
      }, { quoted: msg });
    } finally {
      try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
    }
  },
};
