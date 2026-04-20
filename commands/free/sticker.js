/**
 * NovaSpark Bot v3 — Sticker Maker
 * .sticker — converts replied image/video into a WhatsApp sticker
 * Works with: images (PNG/JPG/WEBP) and short videos (GIF stickers)
 * By Dev-Ntando
 */
'use strict';

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const database = require('../../database');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stik'],
  description: 'Convert any image or short video into a WhatsApp sticker',
  category: 'free',

  execute: async ({ sock, msg, from, sender, reply }) => {
    database.logCommand(sender, 'sticker');

    // ── Locate the media-containing message ──────────────────────────────────
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
                || msg.message?.imageMessage
                || msg.message?.videoMessage
                || null;

    const imgMsg   = msg.message?.imageMessage
                  || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    const vidMsg   = msg.message?.videoMessage
                  || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

    const target = imgMsg ? 'image' : vidMsg ? 'video' : null;

    if (!target) {
      return reply(
        '🖼️ *Sticker Maker*\n\n' +
        'Reply to an *image* or *short video* with *.sticker*\n\n' +
        'Example:\n  ➤ Send or forward a photo\n  ➤ Reply with *.sticker*\n\n' +
        '_Supports: JPG · PNG · WEBP · MP4 (≤8 s)_'
      );
    }

    await sock.sendPresenceUpdate('composing', from);
    await reply('⏳ _Making your sticker..._');

    try {
      // Download the media
      const buffer = await downloadMediaMessage(
        msg,
        'buffer',
        {},
        { logger: require('pino')({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
      );

      if (target === 'image') {
        // ── Image → static sticker ────────────────────────────────────────────
        // Resize to 512×512 with transparent padding, output as WebP
        const sharp = require('sharp');
        const webpBuf = await sharp(buffer)
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 80 })
          .toBuffer();

        await sock.sendMessage(from, {
          sticker: webpBuf,
        }, { quoted: msg });

      } else {
        // ── Video → animated sticker ─────────────────────────────────────────
        // We convert first frame to a static sticker (animated sticker needs
        // ffmpeg binary; if available it creates a true animated webp)
        const { execFile } = require('child_process');
        const fs   = require('fs');
        const os   = require('os');
        const path = require('path');

        const tmpIn  = path.join(os.tmpdir(), `ns_in_${Date.now()}.mp4`);
        const tmpOut = path.join(os.tmpdir(), `ns_out_${Date.now()}.webp`);

        fs.writeFileSync(tmpIn, buffer);

        const ffmpegArgs = [
          '-i', tmpIn,
          '-t', '7',                     // max 7 seconds
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15',
          '-vcodec', 'libwebp',
          '-lossless', '0',
          '-compression_level', '6',
          '-q:v', '50',
          '-loop', '0',
          '-preset', 'default',
          '-an',
          '-vsync', '0',
          tmpOut,
        ];

        await new Promise((resolve, reject) => {
          execFile('ffmpeg', ffmpegArgs, { timeout: 30000 }, (err) => {
            if (err) reject(err); else resolve();
          });
        });

        const webpBuf = fs.readFileSync(tmpOut);
        fs.unlinkSync(tmpIn);
        fs.unlinkSync(tmpOut);

        await sock.sendMessage(from, { sticker: webpBuf }, { quoted: msg });
      }

    } catch (err) {
      console.error('[sticker]', err.message);
      // Graceful fallback: if ffmpeg is missing for video, or sharp fails
      if (err.message?.includes('ffmpeg') || err.message?.includes('ENOENT')) {
        return reply('⚠️ Animated stickers need ffmpeg on the server. For now, try with a *static image*!');
      }
      return reply('❌ Could not make the sticker. Make sure the image isn\'t too large and try again.');
    }
  },
};
