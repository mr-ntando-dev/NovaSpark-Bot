/**
 * ⚡ NovaSpark Bot v11 — .mediainfo
 * Reply to any image, video, audio, sticker, or document to get
 * detailed metadata: codec, resolution, duration, size, MIME type, etc.
 * Pure Node.js — no external binaries required.
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

// ── Human-readable file size ──────────────────────────────────────────────────
function fmtBytes(bytes) {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(2)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

// ── Human-readable duration ───────────────────────────────────────────────────
function fmtDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ');
}

// ── Extract metadata from WhatsApp message object ────────────────────────────
function extractMeta(msgObj) {
  const types = ['imageMessage','videoMessage','audioMessage','stickerMessage',
                 'documentMessage','gifMessage','pttMessage'];
  for (const t of types) {
    if (msgObj[t]) {
      const m = msgObj[t];
      return {
        type:        t.replace('Message', '').toUpperCase(),
        mime:        m.mimetype || 'Unknown',
        fileSize:    m.fileLength || m.fileSize || null,
        width:       m.width  || null,
        height:      m.height || null,
        duration:    m.seconds || m.duration || null,
        caption:     m.caption || null,
        fileName:    m.fileName || m.title || null,
        sha256:      m.fileSha256 ? Buffer.from(m.fileSha256).toString('hex').slice(0, 16) + '…' : null,
        animated:    m.isAnimated || false,
        viewOnce:    m.viewOnce   || false,
        pageCount:   m.pageCount  || null,
        jpegQuality: m.jpegThumbnail ? 'Thumbnail available' : null,
        gifPlayback: m.gifPlayback || false,
        ptt:         t === 'pttMessage' ? true : null, // voice note
        waveform:    m.waveform ? `${m.waveform.length} samples` : null,
      };
    }
  }
  return null;
}

module.exports = {
  name:        'mediainfo',
  aliases:     ['fileinfo', 'imginfo', 'videoinfo', 'audioinfo', 'stickerinfo'],
  category:    'media',
  description: 'Reply to any media/file to get detailed metadata',
  usage:       '.mediainfo  — reply to an image, video, audio, sticker, or document',

  execute: async ({ sock, msg, from, args, reply }) => {
    // Check both direct message and quoted
    const directMsg  = msg.message;
    const quotedMsg  = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const targetMsg  = quotedMsg || directMsg;

    if (!targetMsg) return reply('⚠️ Send or reply to a media file with `.mediainfo`.');

    const meta = extractMeta(targetMsg);

    if (!meta) {
      return reply([
        '📊 *Media Info*',
        '',
        'Reply to an image, video, audio, sticker, GIF, or document.',
        '',
        'Supported:',
        '  🖼️ Images · 🎥 Videos · 🎵 Audio · 🎙️ Voice notes',
        '  🌀 Stickers · 📄 Documents · 🎞️ GIFs',
      ].join('\n'));
    }

    const lines = [
      `📊 *Media Information*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📁 Type:     *${meta.type}*`,
      `🔢 MIME:     \`${meta.mime}\``,
    ];

    if (meta.fileSize) lines.push(`💾 Size:     *${fmtBytes(meta.fileSize)}*`);
    if (meta.width && meta.height) lines.push(`📐 Resolution: *${meta.width} × ${meta.height} px*`);
    if (meta.duration) lines.push(`⏱️ Duration:  *${fmtDuration(meta.duration)}*`);
    if (meta.fileName) lines.push(`📄 Filename:  \`${meta.fileName}\``);
    if (meta.caption)  lines.push(`💬 Caption:   _"${meta.caption.slice(0, 80)}${meta.caption.length > 80 ? '…' : ''}"_`);
    if (meta.pageCount) lines.push(`📑 Pages:    *${meta.pageCount}*`);
    if (meta.sha256)   lines.push(`🔐 SHA256:   \`${meta.sha256}\``);

    // Flags
    const flags = [];
    if (meta.animated) flags.push('🌀 Animated');
    if (meta.viewOnce) flags.push('👁️ View-once');
    if (meta.gifPlayback) flags.push('🎞️ GIF playback');
    if (meta.ptt)      flags.push('🎙️ Voice note (PTT)');
    if (flags.length)  lines.push(`🏷️ Flags:    ${flags.join('  ·  ')}`);
    if (meta.waveform) lines.push(`🎵 Waveform: ${meta.waveform}`);

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`_NovaSpark Bot v${config.botVersion}_`);

    return reply(lines.join('\n'));
  },
};
