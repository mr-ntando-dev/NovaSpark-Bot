/**
 * ⚡ NovaSpark v4 — Remove Background
 * .removebg — Reply to an image to remove its background
 * Uses remove.bg free API (500 calls/month free)
 * Falls back to PhotoRoom if configured
 * NEVER in basic MD bots.
 * By Dev-Ntando
 */
'use strict';
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios    = require('axios');
const FormData = require('form-data');
const config   = require('../../config');

module.exports = {
  name: 'removebg',
  aliases: ['rmbg', 'nobg', 'bgremove'],
  description: '🖼️ Remove background from any image (AI-powered)',
  category: 'media',

  execute: async ({ sock, msg, from, reply }) => {
    const imgMsg =
      msg.message?.imageMessage ||
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

    if (!imgMsg) {
      return reply(
        '🖼️ *Background Remover*\n\n' +
        'Reply to an *image* with `.removebg`\n\n' +
        '_Powered by Remove.bg AI — free to use._\n' +
        '_Set REMOVE_BG_API_KEY env var for more uses._'
      );
    }

    await reply('⏳ _Removing background..._');

    try {
      const buffer = await downloadMediaMessage(
        msg, 'buffer', {},
        { logger: require('pino')({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
      );

      const apiKey = config.apiKeys.remove_bg;

      if (!apiKey) {
        // Fallback: use photoroomapi.com free endpoint
        const form = new FormData();
        form.append('image_file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
        const { data: result } = await axios.post(
          'https://sdk.photoroom.com/v1/segment',
          form,
          { headers: { ...form.getHeaders(), 'x-api-key': 'sandbox_' }, responseType: 'arraybuffer', timeout: 20000 }
        );
        return sock.sendMessage(from, {
          image: Buffer.from(result),
          caption: '🖼️ Background removed!\n_⚡ NovaSpark Bot v4_',
          mimetype: 'image/png',
        }, { quoted: msg });
      }

      const form = new FormData();
      form.append('image_file', buffer, { filename: 'image.png', contentType: 'image/png' });
      form.append('size', 'auto');

      const { data: result } = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        form,
        {
          headers: { ...form.getHeaders(), 'X-Api-Key': apiKey },
          responseType: 'arraybuffer',
          timeout: 20000,
        }
      );

      await sock.sendMessage(from, {
        image:   Buffer.from(result),
        caption: '🖼️ *Background removed!*\n_⚡ NovaSpark Bot v4_',
        mimetype: 'image/png',
      }, { quoted: msg });
    } catch (e) {
      return reply(`❌ Background removal failed: ${e.response?.data?.toString() || e.message}`);
    }
  },
};
