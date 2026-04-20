/**
 * ⚡ NovaSpark Bot v4 — 2026 EDITION
 * Message Handler — Full Feature Set
 * Routes commands, triggers auto-features, manages sessions
 * By Dev-Ntando
 */
'use strict';

const config      = require('./config');
const database    = require('./database');
const path        = require('path');
const fs          = require('fs');

// ── Core command modules ──────────────────────────────────────────────────────
const autochatCmd   = require('./commands/ai/autochat');

// Free
const homeworkCmd   = require('./commands/free/homework');
const essayCmd      = require('./commands/free/essay');
const summarizeCmd  = require('./commands/free/summarize');
const translateCmd  = require('./commands/free/translate');
const studytipsCmd  = require('./commands/free/studytips');
const pdfCmd        = require('./commands/free/pdf');
const myplanCmd     = require('./commands/free/myplan');
const mathCmd       = require('./commands/free/math');
const stickerCmd    = require('./commands/free/sticker');
const newsCmd       = require('./commands/free/news');
const qrCmd         = require('./commands/free/qr');
const factCmd       = require('./commands/free/fact');
const currencyCmd   = require('./commands/free/currency');
const urbanCmd      = require('./commands/free/urban');
const bmiCmd        = require('./commands/free/bmi');
const pollCmd       = require('./commands/free/poll');
const imagineCmd    = require('./commands/free/imagine');
const ttsCmd        = require('./commands/free/tts');
const groupinfoCmd  = require('./commands/free/groupinfo');
const roastCmd      = require('./commands/free/roast');
const menuCmd       = require('./commands/free/menu');

// Premium
const examprepCmd      = require('./commands/premium/examprep');
const codeCmd          = require('./commands/premium/code');
const mystatsCmd       = require('./commands/premium/mystats');
const remindCmd        = require('./commands/premium/remind');
const autostudyCmd     = require('./commands/premium/autostudy');
const custompersonaCmd = require('./commands/premium/custompersona');

// Owner
const setpremiumCmd  = require('./commands/owner/setpremium');
const botstatsCmd    = require('./commands/owner/botstats');
const antideleteCmd  = require('./commands/owner/antidelete');
const warnCmds       = require('./commands/owner/warn');

// ── v4 NEW GROUP COMMANDS ─────────────────────────────────────────────────────
const nightmodeCmd   = require('./commands/group/nightmode');
const antitoxicCmd   = require('./commands/group/antitoxic');
const vipmodeCmd     = require('./commands/group/vipmode');
const ghostCmd       = require('./commands/group/ghostmode');
const autoreactCmd   = require('./commands/group/autoreact');
const welcomeCmds    = require('./commands/group/welcome');
const antiwordCmd    = require('./commands/group/antiword');
const groupstatsCmd  = require('./commands/group/groupstats');
const kickCmds       = require('./commands/group/kick');
const antilinkCmd    = require('./commands/owner/antidelete'); // reuse existing if exists

// ── v4 GAMES ─────────────────────────────────────────────────────────────────
const wordleCmd      = require('./commands/games/wordle');
const triviaCmd      = require('./commands/games/trivia');
const hangmanCmd     = require('./commands/games/hangman');
const rpsCmd         = require('./commands/games/rps');

// ── v4 TOOLS ─────────────────────────────────────────────────────────────────
const calcCmd        = require('./commands/tools/calculator');
const weatherCmd     = require('./commands/tools/weather');
const timeCmd        = require('./commands/tools/time');
const motivateCmd    = require('./commands/tools/motivate');
const profileCmd     = require('./commands/tools/profilecard');

// ── v4 MEDIA ─────────────────────────────────────────────────────────────────
const tiktokCmd      = require('./commands/media/tiktok');
const ytCmd          = require('./commands/media/youtube');
const removebgCmd    = require('./commands/media/removebg');
const textartCmd     = require('./commands/media/textart');

// ── v4 SOCIAL ────────────────────────────────────────────────────────────────
const shipCmd        = require('./commands/social/ship');
const dareCmds       = require('./commands/social/dare');
const complimentCmds = require('./commands/social/compliment');

// ── Build command map ─────────────────────────────────────────────────────────
const ALL_COMMANDS = [
  autochatCmd,
  // free
  homeworkCmd, essayCmd, summarizeCmd, translateCmd, studytipsCmd, pdfCmd, myplanCmd,
  mathCmd, stickerCmd, newsCmd, qrCmd, factCmd, currencyCmd, urbanCmd, bmiCmd,
  pollCmd, imagineCmd, ttsCmd, groupinfoCmd, roastCmd, menuCmd,
  // premium
  examprepCmd, codeCmd, mystatsCmd, remindCmd, autostudyCmd, custompersonaCmd,
  // owner
  setpremiumCmd, botstatsCmd, antideleteCmd,
  ...warnCmds,
  // v4 group
  nightmodeCmd, antitoxicCmd, vipmodeCmd, ghostCmd, autoreactCmd,
  antiwordCmd, groupstatsCmd,
  ...(Array.isArray(welcomeCmds) ? welcomeCmds : [welcomeCmds]),
  ...(Array.isArray(kickCmds)    ? kickCmds    : [kickCmds]),
  // v4 games
  wordleCmd, triviaCmd, hangmanCmd, rpsCmd,
  // v4 tools
  calcCmd, weatherCmd, timeCmd, motivateCmd, profileCmd,
  // v4 media
  tiktokCmd, ytCmd, removebgCmd, textartCmd,
  // v4 social
  shipCmd,
  ...(Array.isArray(dareCmds)       ? dareCmds       : [dareCmds]),
  ...(Array.isArray(complimentCmds) ? complimentCmds : [complimentCmds]),
];

const cmdMap = new Map();
for (const cmd of ALL_COMMANDS) {
  if (!cmd || !cmd.name) continue;
  cmdMap.set(cmd.name.toLowerCase(), cmd);
  if (Array.isArray(cmd.aliases)) {
    for (const alias of cmd.aliases) cmdMap.set(alias.toLowerCase(), cmd);
  }
}

// ── Rate limiter ──────────────────────────────────────────────────────────────
const rateMap = new Map(); // jid → { count, reset }
function isRateLimited(jid) {
  const now   = Date.now();
  const entry = rateMap.get(jid) || { count: 0, reset: now + 60000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60000; }
  entry.count++;
  rateMap.set(jid, entry);
  return entry.count > (config.rateLimitPerMinute || 15);
}

// ── Reminder poller ───────────────────────────────────────────────────────────
let _sock = null;
setInterval(async () => {
  if (!_sock) return;
  try {
    const due = database.getPendingReminders();
    for (const r of due) {
      database.markReminderDone(r.id);
      const chatId = r.chatId !== '__PENDING__' ? r.chatId : `${r.userId}@s.whatsapp.net`;
      await _sock.sendMessage(chatId, {
        text: `🔔 *Reminder!*\n\n📌 _${r.message}_\n\n_NovaSpark Bot v4 ⚡_`,
      }).catch(() => {});
    }
  } catch {}
}, 30000);

// ── Night mode poller ─────────────────────────────────────────────────────────
setInterval(async () => {
  if (!_sock) return;
  try {
    const groups = database.getAllGroupSettings ? database.getAllGroupSettings() : {};
    const nowStr = new Date().toLocaleTimeString('en-ZA', { timeZone: config.timezone, hour: '2-digit', minute: '2-digit', hour12: false });
    for (const [gid, gs] of Object.entries(groups)) {
      if (!gs.nightMode) continue;
      const start = gs.nightStart || '22:00';
      const end   = gs.nightEnd   || '06:00';
      // Simple time check
      const inNight = (start <= end)
        ? (nowStr >= start && nowStr < end)
        : (nowStr >= start || nowStr < end);
      // Sync mute state
      const currentlyMuted = gs._nightMuted || false;
      if (inNight && !currentlyMuted) {
        try { await _sock.groupSettingUpdate(gid, 'announcement'); } catch {}
        database.updateGroupSettings(gid, { _nightMuted: true });
      } else if (!inNight && currentlyMuted) {
        try { await _sock.groupSettingUpdate(gid, 'not_announcement'); } catch {}
        database.updateGroupSettings(gid, { _nightMuted: false });
      }
    }
  } catch {}
}, 60000);

// ── JID helpers ───────────────────────────────────────────────────────────────
const normalizeJid = (jid) => {
  if (!jid || typeof jid !== 'string') return null;
  if (jid.includes(':')) return jid.split(':')[0] + '@' + jid.split('@')[1];
  return jid;
};

const isOwner = (jid) => {
  const num = jid.split('@')[0].split(':')[0];
  return (Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber]).includes(num);
};

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (sock, msg) => {
  _sock = sock;

  if (!msg?.message) return;
  if (msg.key.fromMe) return;

  const from   = msg.key.remoteJid;
  const isGroup = from?.endsWith('@g.us');
  const sender  = isGroup
    ? (msg.key.participant || from)
    : from;
  const senderNorm = normalizeJid(sender);

  // ── Cache message for anti-delete ────────────────────────────────────────
  try { antideleteCmd.cacheMessage?.(msg); } catch {}

  // ── Log analytics ─────────────────────────────────────────────────────────
  try {
    if (database.logMessage) database.logMessage(senderNorm, from, isGroup);
  } catch {}

  // ── Record first seen (profile) ───────────────────────────────────────────
  try {
    const profile = database.getUserProfile ? database.getUserProfile(senderNorm) : {};
    if (!profile.joinDate) {
      if (database.updateUserProfile) database.updateUserProfile(senderNorm, { joinDate: Date.now() });
    }
  } catch {}

  // ── Extract message text ──────────────────────────────────────────────────
  const body =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    '';

  const prefix   = config.prefix || '.';
  const isCmd    = body.startsWith(prefix);
  const cmdName  = isCmd ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args     = isCmd ? body.slice(prefix.length + cmdName.length).trim().split(/\s+/).filter(Boolean) : [];
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  // ── Group settings ────────────────────────────────────────────────────────
  let groupSettings = {};
  let isAdmin       = false;
  let isBotAdmin    = false;
  let groupMeta     = null;

  if (isGroup) {
    groupSettings = database.getGroupSettings(from);
    try {
      groupMeta  = await sock.groupMetadata(from);
      const me   = sock.user?.id ? normalizeJid(sock.user.id) : '';
      isAdmin    = groupMeta.participants.some(p => normalizeJid(p.id) === normalizeJid(senderNorm) && p.admin);
      isBotAdmin = groupMeta.participants.some(p => normalizeJid(p.id) === me && p.admin);
    } catch {}
  }

  // ── Ghost mode — suppress typing/read indicators ─────────────────────────
  if (!groupSettings.ghostMode) {
    try { await sock.readMessages([msg.key]); } catch {}
  }

  // ── Auto-feature pipeline (non-command messages) ─────────────────────────
  if (isGroup && !isCmd) {
    // Log group message for analytics
    try {
      if (database.logGroupMessage) database.logGroupMessage(from, senderNorm);
    } catch {}

    // Anti-toxic scan
    try {
      const handled = await antitoxicCmd.scan(sock, msg, from, groupSettings);
      if (handled) return;
    } catch {}

    // Anti-word filter
    try {
      const handled = await antiwordCmd.check(sock, msg, from, groupSettings);
      if (handled) return;
    } catch {}

    // VIP mode enforcement
    if (groupSettings.vipOnly && !isAdmin && !isOwner(senderNorm)) {
      const vips = groupSettings.vipList || [];
      if (!vips.includes(senderNorm) && !vips.includes(sender)) {
        try {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.sendMessage(from, {
            text: `⭐ *VIP Mode is ON* — Only VIP members can send messages here.\n@${senderNorm.split('@')[0]} — contact an admin to request VIP access.`,
            mentions: [senderNorm],
          });
        } catch {}
        return;
      }
    }

    // Auto-react
    try { await autoreactCmd.react(sock, msg, from, groupSettings); } catch {}

    // Autochat (non-command AI replies)
    if (groupSettings.autochat) {
      try { await autochatCmd.handleMessage?.(sock, msg, from, sender, body, groupSettings); } catch {}
    }
    return;
  }

  // ── Non-group autochat ────────────────────────────────────────────────────
  if (!isGroup && !isCmd) {
    const gs = database.getGroupSettings(from);
    if (gs?.autochat !== false) {
      try { await autochatCmd.handleMessage?.(sock, msg, from, sender, body, gs); } catch {}
    }
    return;
  }

  if (!isCmd) return;

  // ── Rate limit ────────────────────────────────────────────────────────────
  if (!isOwner(senderNorm) && isRateLimited(senderNorm)) {
    return sock.sendMessage(from, { text: config.messages.rateLimited }, { quoted: msg });
  }

  // ── Typing indicator (unless ghost mode) ─────────────────────────────────
  if (!groupSettings.ghostMode) {
    try { await sock.sendPresenceUpdate('composing', from); } catch {}
  }

  // ── Log command ───────────────────────────────────────────────────────────
  try { if (database.logCommand) database.logCommand(senderNorm, cmdName, from); } catch {}

  // ── Reply helper ──────────────────────────────────────────────────────────
  const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

  // ── Find and execute command ──────────────────────────────────────────────
  const cmd = cmdMap.get(cmdName);
  if (!cmd) {
    // Friendly unknown command — only in DMs to avoid group spam
    if (!isGroup) {
      return reply(`❓ Unknown command: \`${prefix}${cmdName}\`\nType \`${prefix}menu\` for the full command list.`);
    }
    return;
  }

  // ── Permission checks ─────────────────────────────────────────────────────
  if (cmd.ownerOnly && !isOwner(senderNorm)) {
    return reply(config.messages.ownerOnly);
  }
  if (cmd.adminOnly && isGroup && !isAdmin && !isOwner(senderNorm)) {
    return reply(config.messages.adminOnly);
  }
  if (cmd.groupOnly && !isGroup) {
    return reply(config.messages.groupOnly);
  }
  if (cmd.privateOnly && isGroup) {
    return reply(config.messages.privateOnly);
  }
  if (cmd.premiumOnly && !isOwner(senderNorm)) {
    const isPrem = database.isPremium ? database.isPremium(senderNorm) : false;
    if (!isPrem) return reply(config.messages.premiumOnly);
  }

  // ── Execute ───────────────────────────────────────────────────────────────
  try {
    await cmd.execute({
      sock, msg, from, sender: senderNorm,
      args, body, reply,
      isAdmin, isBotAdmin,
      isOwner: isOwner(senderNorm),
      isPremium: database.isPremium ? database.isPremium(senderNorm) : false,
      groupMeta, groupSettings,
      mentions,
    });
  } catch (err) {
    console.error(`[CMD ERROR] .${cmdName}:`, err.message);
    try { await reply(`❌ Command failed: ${err.message}`); } catch {}
  }

  // ── Clear typing ──────────────────────────────────────────────────────────
  if (!groupSettings.ghostMode) {
    try { await sock.sendPresenceUpdate('paused', from); } catch {}
  }
};

// ── Export anti-delete handlers for index.js ─────────────────────────────────
module.exports.cacheMessage  = antideleteCmd.cacheMessage;
module.exports.handleDelete  = antideleteCmd.handleDelete;
