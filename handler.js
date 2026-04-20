/**
 * Message Handler — NovaSpark Bot
 * Routes commands: autochat, free plan, premium plan, owner.
 * By Dev-Ntando
 */

'use strict';

const config   = require('./config');
const database = require('./database');
const fs       = require('fs');
const path     = require('path');

// ── Command modules ───────────────────────────────────────────────────────────
const autochatCmd = require('./commands/ai/autochat');

// Free commands
const homeworkCmd  = require('./commands/free/homework');
const essayCmd     = require('./commands/free/essay');
const summarizeCmd = require('./commands/free/summarize');
const translateCmd = require('./commands/free/translate');
const studytipsCmd = require('./commands/free/studytips');
const pdfCmd       = require('./commands/free/pdf');
const myplanCmd    = require('./commands/free/myplan');
const mathCmd      = require('./commands/free/math');      // math is now FREE
const weatherCmd   = require('./commands/free/weather');   // new free weather command

// Premium commands
const examprepCmd     = require('./commands/premium/examprep');
const codeCmd         = require('./commands/premium/code');
const mystatsCmd      = require('./commands/premium/mystats');
const remindCmd       = require('./commands/premium/remind');
const autostudyCmd    = require('./commands/premium/autostudy');
const custompersonaCmd = require('./commands/premium/custompersona');

// Owner commands
const setpremiumCmd = require('./commands/owner/setpremium');
const botstatsCmd   = require('./commands/owner/botstats');

// ── Build command map ─────────────────────────────────────────────────────────
const ALL_COMMANDS = [
  autochatCmd,
  homeworkCmd, essayCmd, summarizeCmd, translateCmd, studytipsCmd, pdfCmd, myplanCmd,
  mathCmd, weatherCmd,                                       // free — math & weather
  examprepCmd, codeCmd, mystatsCmd, remindCmd, autostudyCmd, custompersonaCmd,
  setpremiumCmd, botstatsCmd,
];

const cmdMap = new Map();
for (const cmd of ALL_COMMANDS) {
  if (cmd.name) cmdMap.set(cmd.name.toLowerCase(), cmd);
  if (Array.isArray(cmd.aliases)) {
    for (const alias of cmd.aliases) cmdMap.set(alias.toLowerCase(), cmd);
  }
}

// ── Reminder poller (check every 30 seconds) ─────────────────────────────────
let _sock = null;
setInterval(async () => {
  if (!_sock) return;
  try {
    const due = database.getPendingReminders();
    for (const r of due) {
      database.markReminderDone(r.id);
      const chatId = r.chatId !== '__PENDING__' ? r.chatId : `${r.userId}@s.whatsapp.net`;
      await _sock.sendMessage(chatId, {
        text: `🔔 *Reminder!*\n\n📌 _${r.message}_\n\n_NovaSpark Bot ⚡_`
      }).catch(() => {});
    }
  } catch { /* silent */ }
}, 30000);

// ── JID helpers ───────────────────────────────────────────────────────────────
const normalizeJid = (jid) => {
  if (!jid || typeof jid !== 'string') return null;
  if (jid.includes(':')) return jid.split(':')[0];
  if (jid.includes('@')) return jid.split('@')[0];
  return jid;
};

const isOwner = (sender) => {
  if (!sender) return false;
  const num = normalizeJid(sender);
  return config.ownerNumber.some(o => normalizeJid(o.includes('@') ? o : o + '@s.whatsapp.net') === num);
};

// ── Group metadata cache ──────────────────────────────────────────────────────
const groupMetaCache = new Map();
const getGroupMeta = async (sock, groupId) => {
  try {
    if (!groupId || !groupId.endsWith('@g.us')) return null;
    const cached = groupMetaCache.get(groupId);
    if (cached && Date.now() - cached.ts < 60000) return cached.data;
    const meta = await sock.groupMetadata(groupId);
    groupMetaCache.set(groupId, { data: meta, ts: Date.now() });
    return meta;
  } catch {
    return groupMetaCache.get(groupId)?.data || null;
  }
};

// ── Unwrap WhatsApp message ───────────────────────────────────────────────────
const getMessageContent = (msg) => {
  if (!msg || !msg.message) return null;
  let m = msg.message;
  if (m.ephemeralMessage)           m = m.ephemeralMessage.message;
  if (m.viewOnceMessageV2)          m = m.viewOnceMessageV2.message;
  if (m.viewOnceMessage)            m = m.viewOnceMessage.message;
  if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;
  return m;
};

// ── Main message handler ──────────────────────────────────────────────────────
const handleMessage = async (sock, msg) => {
  _sock = sock; // keep ref for reminder poller

  try {
    if (!msg || !msg.key || !msg.message) return;
    if (msg.key.fromMe) return;

    const messageContent = getMessageContent(msg);
    if (!messageContent) return;

    const from    = msg.key.remoteJid;
    const sender  = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    const text =
      messageContent.conversation ||
      messageContent.extendedTextMessage?.text ||
      messageContent.imageMessage?.caption ||
      messageContent.videoMessage?.caption ||
      messageContent.documentMessage?.caption ||
      '';

    const body = text.trim();

    // ── Build context object ──────────────────────────────────────────────────
    const groupMetadata = isGroup ? await getGroupMeta(sock, from) : null;
    const isAdmin = isGroup && groupMetadata?.participants
      ? groupMetadata.participants.some(p =>
          normalizeJid(p.id) === normalizeJid(sender) &&
          (p.admin === 'admin' || p.admin === 'superadmin'))
      : false;

    const ctx = {
      sock,
      msg,
      from,
      sender,
      body,
      isGroup,
      isOwner:      isOwner(sender),
      isAdmin,
      groupMetadata,
      messageContent,
      database,
      config,
      reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
    };

    // ── Command routing ───────────────────────────────────────────────────────
    if (body.startsWith(config.prefix)) {
      const withoutPrefix = body.slice(config.prefix.length).trim();
      const [cmdName, ...args] = withoutPrefix.split(/\s+/);
      const cmd = cmdMap.get(cmdName.toLowerCase());

      if (cmd) {
        ctx.args = args;
        database.logCommand(sender, cmdName.toLowerCase());
        await cmd.execute(ctx);
        return;
      }

      // Unknown command — only reply if autochat is OFF (avoid polluting AI chat)
      const autochatSession = autochatCmd.sessions.get(from);
      if (!autochatSession?.enabled) {
        await ctx.reply(
          `❓ Unknown command. Here are the available commands:\n\n` +
          `*🆓 Free (always active — auto-detected):*\n` +
          `  🔢 .math  🌤️ .weather  📚 .homework\n` +
          `  ✍️ .essay  📝 .summarize  🌍 .translate\n` +
          `  📖 .studytips  📄 .pdf  📋 .myplan\n\n` +
          `*⚙️ AutoChat:*\n` +
          `  .autochat off/on/status/reset\n` +
          `  .autochat persona <name>\n\n` +
          `*💎 Premium:*\n` +
          `  .examprep .code .remind .mystats\n` +
          `  .autostudy .setpersona\n\n` +
          `_Type .myplan to see your plan & upgrade info._\n\n` +
          `_Nova AI ⚡_`
        );
      }
      return;
    }

    // ── AutoChat passive handler ──────────────────────────────────────────────
    if (autochatCmd.handleMessage) {
      await autochatCmd.handleMessage(ctx);
    }

  } catch (err) {
    console.error('❌ Handler error:', err.message);
  }
};

module.exports = { handleMessage };
