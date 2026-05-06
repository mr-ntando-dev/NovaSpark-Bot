/**
 * ⚡ NovaSpark Bot v11 — .stealsticker
 * Reply to any sticker to re-pack it with a custom author & pack name.
 * Supports static WebP and animated WebP stickers.
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = {
  name:        'stealsticker',
  aliases:     ['steal', 'takesticker', 'repack', 'copysticker'],
  category:    'media',
  description: 'Reply to a sticker to steal/repack it with your bot branding',
  usage:       '.stealsticker [PackName] [Author]  — reply to a sticker',

  execute: async ({ sock, msg, from, args, reply, sender }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      || msg.message?.stickerMessage;

    // Resolve sticker message
    const stickerMsg = quoted?.stickerMessage
      || (msg.message?.stickerMessage ? msg.message : null)?.message?.stickerMessage;

    if (!stickerMsg) {
      return reply([
        '🎨 *Sticker Stealer*',
        '',
        'Reply to any sticker with `.stealsticker` to steal it.',
        'Optionally set a custom name:',
        '  `.stealsticker MyPack Ntando`',
      ].join('\n'));
    }

    const packName   = args[0] || config.botName  || 'NovaSpark';
    const authorName = args[1] || config.ownerName?.[0] || 'Dev-Ntando';

    try {
      // Download the sticker buffer
      const stream = await sock.downloadMediaMessage(
        {
          key: msg.message?.extendedTextMessage?.contextInfo?.stanzaId
            ? { ...msg.key, id: msg.message.extendedTextMessage.contextInfo.stanzaId }
            : msg.key,
          message: quoted || msg.message,
        }
      );

      // Inject EXIF metadata (pack name + author) into the WebP
      // WhatsApp reads these from a custom EXIF chunk in the WebP container
      const exifJson = JSON.stringify({
        'sticker-pack-name':   packName,
        'sticker-pack-publisher': authorName,
        'emojis': ['⚡'],
      });

      // Build minimal EXIF chunk wrapper for WhatsApp
      const exifBuf = buildExifChunk(exifJson);

      let webpBuf;
      if (Buffer.isBuffer(stream)) {
        webpBuf = stream;
      } else {
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        webpBuf = Buffer.concat(chunks);
      }

      const patched = injectExif(webpBuf, exifBuf);

      await sock.sendMessage(from, {
        sticker: patched,
      }, { quoted: msg });

      await sock.sendMessage(from, {
        text: `✅ Sticker stolen!\n📦 Pack: *${packName}*\n✍️ Author: *${authorName}*`,
      }, { quoted: msg });

    } catch (e) {
      return reply(`❌ Failed to steal sticker: ${e.message}\n\nMake sure you replied directly to a sticker.`);
    }
  },
};

// ── WebP EXIF injection helpers ───────────────────────────────────────────────
function buildExifChunk(json) {
  const jsonBuf = Buffer.from(json, 'utf-8');
  // EXIF header: 0x45 0x78 0x69 0x66 0x00 0x00 (Exif\0\0) then 0x49 0x49 (little-endian) + TIFF header
  const header = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]);
  // IFD with 1 entry: tag 0x9286 (UserComment), type 7 (UNDEFINED), count = jsonBuf.length
  const ifdCount = Buffer.alloc(2); ifdCount.writeUInt16LE(1, 0);
  const tag      = Buffer.alloc(2); tag.writeUInt16LE(0x9286, 0); // UserComment
  const type     = Buffer.alloc(2); type.writeUInt16LE(7, 0);     // UNDEFINED
  const count    = Buffer.alloc(4); count.writeUInt32LE(jsonBuf.length, 0);
  const offset   = Buffer.alloc(4); offset.writeUInt32LE(8 + 2 + 12 + 4, 0); // after IFD
  const ifdNext  = Buffer.alloc(4); // 0 = no next IFD
  const ifdEntry = Buffer.concat([tag, type, count, offset]);
  const tiff     = Buffer.concat([header, ifdCount, ifdEntry, ifdNext]);
  const exifFull = Buffer.concat([Buffer.from('Exif\0\0'), tiff, jsonBuf]);
  return exifFull;
}

function injectExif(webp, exifChunk) {
  // WebP: RIFF????WEBP VP8 /VP8L/VP8X ... we need to add EXIF chunk
  // Simple approach: if VP8X header present, patch flags; otherwise wrap in VP8X
  const riff = webp.slice(0, 4).toString();
  if (riff !== 'RIFF') return webp; // not a valid WebP, return as-is

  const webpStr = webp.slice(8, 12).toString();
  if (webpStr !== 'WEBP') return webp;

  // Build EXIF chunk: "EXIF" + uint32LE(size) + data (padded to even)
  const chunkId   = Buffer.from('EXIF');
  const sizeBuf   = Buffer.alloc(4);
  sizeBuf.writeUInt32LE(exifChunk.length, 0);
  const padding   = exifChunk.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
  const exifBlock = Buffer.concat([chunkId, sizeBuf, exifChunk, padding]);

  // Try to find VP8X chunk and set EXIF flag, otherwise just append EXIF block
  const hasVP8X = webp.slice(12, 16).toString() === 'VP8X';
  let result;
  if (hasVP8X) {
    // Set EXIF flag bit (bit 3) in VP8X flags (byte 20)
    const patched = Buffer.from(webp);
    patched[20] = patched[20] | 0x08;
    result = Buffer.concat([patched, exifBlock]);
  } else {
    // Need to create VP8X chunk wrapping the existing VP8 data
    // For simplicity just append — WhatsApp still reads the pack name
    result = Buffer.concat([webp, exifBlock]);
  }

  // Update RIFF file size
  result.writeUInt32LE(result.length - 8, 4);
  return result;
}
