/**
 * NovaSpark Bot v3 — Anti-Delete System
 * .antidelete on/off  — owner command
 * When enabled: caches every message and forwards deleted ones to the owner in DM
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');
const config   = require('../../config');

// ── In-memory message cache (chatId → Map<messageId, cachedMsg>) ──────────────
// This is intentionally in-memory so it resets on restart (privacy-respecting)
const msgCache = new Map();
const MAX_CACHE_PER_CHAT = 200; // keep last 200 messages per chat

/**
 * Called by handler.js on every incoming message to populate the cache.
 * Export this so handler.js can call it.
 */
function cacheMessage(msg) {
  const { id }    = msg.key;
  const chatId    = msg.key.remoteJid;
  const sender    = msg.key.participant || msg.key.remoteJid;
  const timestamp = msg.messageTimestamp;

  if (!msgCache.has(chatId)) msgCache.set(chatId, new Map());
  const chatMap = msgCache.get(chatId);

  // Extract text content (handle various message types)
  let content = null;
  const m     = msg.message;

  if (m?.conversation)                 content = { type: 'text',  text: m.conversation };
  else if (m?.extendedTextMessage)     content = { type: 'text',  text: m.extendedTextMessage.text };
  else if (m?.imageMessage)            content = { type: 'image', caption: m.imageMessage.caption || '', raw: m };
  else if (m?.videoMessage)            content = { type: 'video', caption: m.videoMessage.caption || '', raw: m };
  else if (m?.audioMessage)            content = { type: 'audio', raw: m };
  else if (m?.documentMessage)         content = { type: 'doc',   filename: m.documentMessage.fileName || 'file', raw: m };
  else if (m?.stickerMessage)          content = { type: 'sticker', raw: m };
  else                                 content = { type: 'unknown' };

  chatMap.set(id, { id, chatId, sender, timestamp, content });

  // Trim if over limit
  if (chatMap.size > MAX_CACHE_PER_CHAT) {
    const oldest = chatMap.keys().next().value;
    chatMap.delete(oldest);
  }
}

/**
 * Called by handler.js when a message-delete event fires.
 * Forwards the cached message to all owner numbers.
 */
async function handleDelete(sock, update) {
  const isEnabled = database.getSetting('antidelete_enabled');
  if (!isEnabled) return;

  const { keys } = update;
  if (!keys?.length) return;

  const owners = (Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber])
    .map(n => n + '@s.whatsapp.net');

  for (const key of keys) {
    const chatId = key.remoteJid;
    const msgId  = key.id;
    const chatMap = msgCache.get(chatId);

    if (!chatMap?.has(msgId)) continue; // not cached

    const cached  = chatMap.get(msgId);
    const senderNum = cached.sender.split('@')[0];
    const chatNum   = chatId.split('@')[0];
    const time      = new Date(cached.timestamp * 1000).toLocaleString('en-ZA', {
      timeZone: 'Africa/Harare', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const header =
      `🗑️ *Deleted Message Caught!*\n` +
      `${'─'.repeat(28)}\n` +
      `📱 *From:*  +${senderNum}\n` +
      `💬 *In:*    ${chatId.includes('@g.us') ? 'Group ' + chatNum : 'DM'}\n` +
      `🕐 *Time:*  ${time}\n` +
      `${'─'.repeat(28)}\n\n`;

    for (const ownerJid of owners) {
      try {
        if (cached.content.type === 'text') {
          await sock.sendMessage(ownerJid, {
            text: header + `*Content:*\n${cached.content.text}`,
          });
        } else {
          await sock.sendMessage(ownerJid, {
            text: header + `*Type:* ${cached.content.type}` +
                  (cached.content.caption ? `\n*Caption:* ${cached.content.caption}` : '') +
                  (cached.content.filename ? `\n*File:* ${cached.content.filename}` : ''),
          });
        }
      } catch (e) {
        console.error('[antidelete] forward error:', e.message);
      }
    }
  }
}

// ── Command definition ────────────────────────────────────────────────────────
module.exports = {
  name: 'antidelete',
  aliases: ['ad'],
  description: '(Owner) Toggle anti-delete: catches messages deleted by others',
  category: 'owner',

  // Export helpers for handler.js
  cacheMessage,
  handleDelete,

  execute: async ({ sock, from, sender, args, isOwner, reply }) => {
    if (!isOwner) return reply(config.messages.ownerOnly);

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      database.setSetting('antidelete_enabled', true);
      return reply(
        `🛡️ *Anti-Delete: ENABLED*\n\n` +
        `I will now catch deleted messages and forward them to your DM.\n\n` +
        `_Only messages sent while I'm online can be caught._\n` +
        `_Nova AI ⚡_`
      );
    }

    if (sub === 'off') {
      database.setSetting('antidelete_enabled', false);
      return reply(`🔕 *Anti-Delete: DISABLED*\n\nDeleted messages will no longer be forwarded.\n\n_Nova AI ⚡_`);
    }

    const isOn = database.getSetting('antidelete_enabled');
    return reply(
      `🛡️ *Anti-Delete System*\n\n` +
      `Current Status: ${isOn ? '*ON* ✅' : '*OFF* ❌'}\n\n` +
      `Usage:\n  .antidelete on\n  .antidelete off\n\n` +
      `_Nova AI ⚡_`
    );
  },
};
