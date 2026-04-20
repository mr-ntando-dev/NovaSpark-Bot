/**
 * Message Handler — NovaSpark Bot
 * Processes incoming messages and routes to AutoChat only.
 * By Dev-Ntando
 */

'use strict';

const config   = require('./config');
const database = require('./database');
const { jidDecode } = require('@whiskeysockets/baileys');
const fs   = require('fs');
const path = require('path');

// ── AutoChat AI (per-chat toggle) ─────────────────────────────────────────────
const autochatCmd = require('./commands/ai/autochat');

// Group metadata cache to prevent rate limiting
const groupMetadataCache = new Map();
const CACHE_TTL = 60000; // 1 minute

// ── Unwrap WhatsApp message containers ────────────────────────────────────────
const getMessageContent = (msg) => {
  if (!msg || !msg.message) return null;
  let m = msg.message;
  if (m.ephemeralMessage)           m = m.ephemeralMessage.message;
  if (m.viewOnceMessageV2)          m = m.viewOnceMessageV2.message;
  if (m.viewOnceMessage)            m = m.viewOnceMessage.message;
  if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;
  return m;
};

// ── Cached group metadata ─────────────────────────────────────────────────────
const getGroupMetadata = async (sock, groupId) => {
  try {
    if (!groupId || !groupId.endsWith('@g.us')) return null;
    const cached = groupMetadataCache.get(groupId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
    const metadata = await sock.groupMetadata(groupId);
    groupMetadataCache.set(groupId, { data: metadata, timestamp: Date.now() });
    return metadata;
  } catch {
    const cached = groupMetadataCache.get(groupId);
    return cached ? cached.data : null;
  }
};

// ── Normalize JID helpers ─────────────────────────────────────────────────────
const normalizeJid = (jid) => {
  if (!jid || typeof jid !== 'string') return null;
  if (jid.includes(':')) return jid.split(':')[0];
  if (jid.includes('@')) return jid.split('@')[0];
  return jid;
};

const normalizeJidWithLid = (jid) => {
  if (!jid) return jid;
  const sessionPath = path.join(__dirname, config.sessionName || 'session');
  const num = jid.includes('@') ? jid.split('@')[0] : jid;
  const domain = jid.includes('@') ? jid.split('@')[1] : 's.whatsapp.net';
  const mapping = path.join(sessionPath, `lid-mapping-${num}.json`);
  if (fs.existsSync(mapping)) {
    try {
      const data = JSON.parse(fs.readFileSync(mapping, 'utf8'));
      if (data) return `${data}@${domain}`;
    } catch { /* ignore */ }
  }
  return jid;
};

// ── Owner check ───────────────────────────────────────────────────────────────
const isOwner = (sender) => {
  if (!sender) return false;
  const senderNumber = normalizeJid(normalizeJidWithLid(sender));
  return config.ownerNumber.some(owner => {
    const ownerJid = owner.includes('@') ? owner : `${owner}@s.whatsapp.net`;
    return normalizeJid(normalizeJidWithLid(ownerJid)) === senderNumber;
  });
};

// ── Main message handler ──────────────────────────────────────────────────────
const handleMessage = async (sock, msg) => {
  try {
    if (!msg || !msg.key || !msg.message) return;
    if (msg.key.fromMe) return;

    const messageContent = getMessageContent(msg);
    if (!messageContent) return;

    const from    = msg.key.remoteJid;
    const sender  = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    // Extract text
    const text =
      messageContent.conversation ||
      messageContent.extendedTextMessage?.text ||
      messageContent.imageMessage?.caption ||
      messageContent.videoMessage?.caption ||
      messageContent.documentMessage?.caption ||
      '';

    const body = text.trim();

    // ── Command routing (.autochat ...) ──────────────────────────────────────
    if (body.toLowerCase().startsWith(`${config.prefix}autochat`)) {
      const groupMetadata = isGroup ? await getGroupMetadata(sock, from) : null;
      const isAdmin = isGroup && groupMetadata?.participants
        ? groupMetadata.participants.some(p => normalizeJid(p.id) === normalizeJid(sender) && (p.admin === 'admin' || p.admin === 'superadmin'))
        : false;

      const ctx = {
        sock,
        msg,
        from,
        sender,
        body,
        args:         body.split(' ').slice(1),
        isGroup,
        isOwner:      isOwner(sender),
        isAdmin,
        groupMetadata,
        messageContent,
        database,
        config,
        reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
      };

      await autochatCmd.execute(ctx);
      return;
    }

    // ── AutoChat passive handler (responds to all messages when enabled) ──────
    if (autochatCmd.handleMessage) {
      const groupMetadata = isGroup ? await getGroupMetadata(sock, from) : null;
      const ctx = {
        sock,
        msg,
        from,
        sender,
        body,
        isGroup,
        isOwner:      isOwner(sender),
        groupMetadata,
        messageContent,
        database,
        config,
        reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
      };
      await autochatCmd.handleMessage(ctx);
    }

  } catch (err) {
    console.error('❌ Handler error:', err.message);
  }
};

module.exports = { handleMessage };
