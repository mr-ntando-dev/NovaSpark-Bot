/**
 * ⚡ NovaSpark Bot v5 — 2026 EDITION
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

// ── v5 NEW GROUP COMMANDS ─────────────────────────────────────────────────────
const antilinkCmd    = require('./commands/group/antilink');
const promoteCmd     = require('./commands/group/promote');
const demoteCmd      = require('./commands/group/demote');
const tagallCmd      = require('./commands/group/tagall');
const hidetagCmd     = require('./commands/group/hidetag');
const muteCmd        = require('./commands/group/mute');
const unmuteCmd      = require('./commands/group/unmute');
const deleteCmd      = require('./commands/group/delete');
const resetlinkCmd   = require('./commands/group/resetlink');
const grouplinkCmd   = require('./commands/group/grouplink');

// ── v5 DOWNLOADS ─────────────────────────────────────────────────────────────
const ytmp3Cmd       = require('./commands/downloads/ytmp3');
const ytmp4Cmd       = require('./commands/downloads/ytmp4');
const tiktokDlCmd    = require('./commands/downloads/tiktokdl');
const instagramCmd   = require('./commands/downloads/instagram');
const facebookCmd    = require('./commands/downloads/facebook');
const pinterestCmd   = require('./commands/downloads/pinterest');
const spotifyCmd     = require('./commands/downloads/spotify');

// ── v5 GENERAL ────────────────────────────────────────────────────────────────
const viewonceCmd    = require('./commands/general/viewonce');
const simageCmd      = require('./commands/general/simage');
const sswebCmd       = require('./commands/general/ssweb');
const myactivityCmd  = require('./commands/general/myactivity');
const topmembersCmd  = require('./commands/general/topmembers');

// ── v5 AI ─────────────────────────────────────────────────────────────────────
const gptCmd         = require('./commands/ai/gpt');
const geminiCmd      = require('./commands/ai/gemini');
const imagine2Cmd    = require('./commands/ai/imagine2');
const reminiCmd      = require('./commands/ai/remini');
const characterCmd   = require('./commands/ai/character');

// ── v5 FUN COMMANDS ───────────────────────────────────────────────────────────
const jokeCmd        = require('./commands/fun/joke');
const flirtCmd       = require('./commands/fun/flirt');
const insultCmd      = require('./commands/fun/insult');
const truthCmd       = require('./commands/fun/truth');
const eightballCmd   = require('./commands/fun/8ball');
const memeCmd        = require('./commands/fun/meme');
const gayrateCmd     = require('./commands/fun/gayrate');
const quoteCmd       = require('./commands/fun/quote');
const lyricsCmd      = require('./commands/fun/lyrics');

// ── v5.1 NEW COMMANDS ─────────────────────────────────────────────────────────
const flipCmd        = require('./commands/fun/flip');
const diceCmd        = require('./commands/fun/dice');
const horoscopeCmd   = require('./commands/fun/horoscope');
const riddleCmd      = require('./commands/fun/riddle');
const dareCmd        = require('./commands/free/dare');
const passwordCmd    = require('./commands/free/password');
const countdownCmd   = require('./commands/free/countdown');
const colorCmd       = require('./commands/free/color');
const nasaCmd        = require('./commands/free/nasa');
const buttonMenuCmd  = require('./commands/free/buttonmenu');

// ── v5.2 NEW AUTO-FEATURES & COMMANDS ────────────────────────────────────────
const antifloodCmd    = require('./commands/group/antiflood');
const autokickCmd     = require('./commands/group/autokick');
const autostatusCmd   = require('./commands/group/autostatus');
const autoreplykwCmd  = require('./commands/group/autoreplykw');
const antiraidCmd     = require('./commands/group/antiraid');
const autonudgeCmd    = require('./commands/group/autonudge');
// v5.2 fun
const twotruthCmd     = require('./commands/fun/twotruth');
const wyrCmd          = require('./commands/fun/wouldyourather');
// v5.2 tools
const defineCmd       = require('./commands/tools/dictionary');
const ipCmd           = require('./commands/tools/ip');
const cryptoCmd       = require('./commands/tools/crypto');
const shorturlCmd     = require('./commands/tools/shorturl');
const bibleCmd        = require('./commands/tools/bible');
const genmusicCmd     = require('./commands/ai/genmusic');

// ── v5 OWNER COMMANDS ─────────────────────────────────────────────────────────
const anticallCmd    = require('./commands/owner/anticall');
const pmblockerCmd   = require('./commands/owner/pmblocker');

// ── v5.1 OWNER COMMANDS ───────────────────────────────────────────────────────
const banCmds          = require('./commands/owner/ban');
const shutdownCmds     = require('./commands/owner/shutdown');
const setprofileCmds   = require('./commands/owner/setprofile');
const setprefixCmds    = require('./commands/owner/setprefix');
const groupManageCmds  = require('./commands/owner/groupmanage');
const maintenanceCmds  = require('./commands/owner/maintenance');
const cleardbCmd       = require('./commands/owner/cleardb');
const announceCmds     = require('./commands/owner/announce');
const dmCmd            = require('./commands/owner/dmowner');

// Helpers extracted from new owner modules
const { isBanned }     = require('./commands/owner/ban');
const { getModeState } = require('./commands/owner/maintenance');
const broadcastCmd   = require('./commands/owner/broadcast');
const autoreadCmd    = require('./commands/owner/autoread');

// ── v5.3 owner auto-commands ──────────────────────────────────────────────────
const autotypingCmd  = require('./commands/owner/autotyping');
const autoonlineCmd  = require('./commands/owner/autoonline');
const autoreplyCmd   = require('./commands/owner/autoreply');
const autoleaveCmd   = require('./commands/owner/autoleave');
const autobackupCmd  = require('./commands/owner/autobackup');

// ── v5.3 MISSING REGISTRATIONS — added now ────────────────────────────────────
const adviceCmd      = require('./commands/tools/advice');
const ageCmd         = require('./commands/tools/age');
const catfactCmd     = require('./commands/tools/catfact');
const dogfactCmd     = require('./commands/tools/dogfact');
const dadjokecmd     = require('./commands/tools/joke2');
const numfactCmd     = require('./commands/tools/numberfact');
const emojiCmd       = require('./commands/tools/emoji');
const encodeCmd      = require('./commands/tools/encode');
const complimentmeCmd = require('./commands/fun/complimentme');
const rouletteCmd    = require('./commands/fun/roulette');
const spiritlevelCmd = require('./commands/fun/spiritlevel');
const waifuCmd       = require('./commands/fun/waifu');
const tagadminsCmd   = require('./commands/group/tagadmins');
const membercountCmd = require('./commands/group/membercount');

// ── v5.3 NEW FEATURES ────────────────────────────────────────────────────────
const waprotectCmd   = require('./commands/owner/waprotect');
const tempnumberCmd  = require('./commands/tools/tempnumber');

// ── v7.0 NEW PROTECTION COMMANDS ─────────────────────────────────────────────
const antifwdCmd      = require('./commands/group/antifwd');
const antispamCmd     = require('./commands/group/antispam');
const antibadwordCmd  = require('./commands/group/antibadword');
const antifakeCmd     = require('./commands/group/antifake');
const groupbackupCmd  = require('./commands/group/groupbackup');
const autoprotectCmd  = require('./commands/owner/autoprotect');

// ── v6.0 INSPIRE / FAITH ─────────────────────────────────────────────────────
const tbjCmd         = require('./commands/inspire/tbj');
const prayerCmd      = require('./commands/inspire/prayer');

// ── v6.0 OWNER SCHEDULERS ────────────────────────────────────────────────────
const autogmCmd      = require('./commands/owner/autogoodmorning');
const autoverseCmd   = require('./commands/owner/autoverse');
const autoprayerCmd  = require('./commands/owner/autoprayer');

// ── v5 TOOLS ─────────────────────────────────────────────────────────────────
const pingCmd        = require('./commands/tools/ping');
const aliveCmd       = require('./commands/tools/alive');
const getppCmd       = require('./commands/tools/getpp');
const ownerCmd       = require('./commands/tools/owner');

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
  // v5 group
  antilinkCmd, promoteCmd, demoteCmd, tagallCmd, hidetagCmd,
  muteCmd, unmuteCmd, deleteCmd, resetlinkCmd, grouplinkCmd,
  // v5 fun
  jokeCmd, flirtCmd, insultCmd, truthCmd, eightballCmd,
  memeCmd, gayrateCmd, quoteCmd, lyricsCmd,
  // v5 owner
  anticallCmd, pmblockerCmd, broadcastCmd, autoreadCmd,
  // v5 tools
  pingCmd, aliveCmd, getppCmd, ownerCmd,
  // v5 downloads
  ytmp3Cmd, ytmp4Cmd, tiktokDlCmd, instagramCmd, facebookCmd, pinterestCmd, spotifyCmd,
  // v5 general
  viewonceCmd, simageCmd, sswebCmd, myactivityCmd, topmembersCmd,
  // v5 AI
  gptCmd, geminiCmd, imagine2Cmd, reminiCmd, characterCmd,
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
  // v5.1 new commands
  flipCmd, diceCmd, horoscopeCmd, riddleCmd, dareCmd,
  passwordCmd, countdownCmd, colorCmd, nasaCmd, buttonMenuCmd,
  // v5.2 group auto-features
  antifloodCmd, autokickCmd, autostatusCmd, autoreplykwCmd, antiraidCmd, autonudgeCmd,
  // v5.2 fun
  twotruthCmd, wyrCmd,
  // v5.2 tools
  defineCmd, ipCmd, cryptoCmd, shorturlCmd, bibleCmd,
  // v5.2 AI
  genmusicCmd,
  // v5.1 owner commands
  ...(Array.isArray(banCmds)         ? banCmds.filter(c => c.name)         : [banCmds].filter(c => c && c.name)),
  ...(Array.isArray(shutdownCmds)    ? shutdownCmds                        : [shutdownCmds]),
  ...(Array.isArray(setprofileCmds)  ? setprofileCmds                      : [setprofileCmds]),
  ...(Array.isArray(setprefixCmds)   ? setprefixCmds.filter(c => c.name)   : [setprefixCmds].filter(c => c && c.name)),
  ...(Array.isArray(groupManageCmds) ? groupManageCmds                     : [groupManageCmds]),
  ...(Array.isArray(maintenanceCmds) ? maintenanceCmds.filter(c => c.name) : [maintenanceCmds].filter(c => c && c.name)),
  cleardbCmd,
  ...(Array.isArray(announceCmds)    ? announceCmds                        : [announceCmds]),
  dmCmd,
  // v5.3 owner auto-commands
  autotypingCmd, autoonlineCmd, autoreplyCmd, autoleaveCmd, autobackupCmd,
  // v5.3 previously unregistered commands (now fixed)
  adviceCmd, ageCmd, catfactCmd, dogfactCmd, dadjokecmd, numfactCmd,
  emojiCmd, encodeCmd,
  complimentmeCmd, rouletteCmd, spiritlevelCmd, waifuCmd,
  tagadminsCmd, membercountCmd,
  // v5.3 new features
  waprotectCmd, tempnumberCmd,
  // v6.0 inspire / faith
  tbjCmd, prayerCmd,
  // v6.0 owner schedulers
  autogmCmd, autoverseCmd, autoprayerCmd,
  // v7.0 protection suite
  antifwdCmd, antispamCmd, antibadwordCmd, antifakeCmd,
  groupbackupCmd, autoprotectCmd,
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

// ── Auto-Kick poller (v5.2) ───────────────────────────────────────────────────
setInterval(async () => {
  if (!_sock) return;
  try { await autokickCmd.pollKicks(_sock); } catch {}
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
  if (!jid) return false;
  // Strip device suffix (multi-device: 263786831091:12@s.whatsapp.net → 263786831091)
  const num = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
  const owners = (Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber])
    .map(n => String(n).replace(/\D/g, ''));
  return owners.includes(num);
};

// ── v6.0 Scheduler startup (called once on first message) ─────────────────────
let _v6SchedulersStarted = false;
function startV6Schedulers(sock) {
  if (_v6SchedulersStarted) return;
  _v6SchedulersStarted = true;
  try { tbjCmd.startTBJScheduler && tbjCmd.startTBJScheduler(sock); } catch {}
  try { autogmCmd.startAutoGMScheduler && autogmCmd.startAutoGMScheduler(sock); } catch {}
  try { autoverseCmd.startAutoVerseScheduler && autoverseCmd.startAutoVerseScheduler(sock); } catch {}
  try { autoprayerCmd.startAutoPrayerScheduler && autoprayerCmd.startAutoPrayerScheduler(sock); } catch {}
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (sock, msg) => {
  _sock = sock;
  startV6Schedulers(sock);

  if (!msg?.message) return;
  // index.js already gates fromMe — only owner commands reach here.
  // fromMe=true means the owner typed the command on their own device.
  // We simply allow all messages that arrive here through.

  const from   = msg.key.remoteJid;
  const isGroup = from?.endsWith('@g.us');

  // For fromMe messages in a DM: remoteJid is the CHAT (other person or self),
  // but we need the sender to be the owner's number for isOwner() to pass.
  // index.js patches _ownerOverride for this exact case.
  const sender  = isGroup
    ? (msg.key.participant || from)
    : (msg._ownerOverride || (msg.key.fromMe
        ? `${(Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber)}@s.whatsapp.net`
        : from));
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

    // Anti-link check (v7 — enhanced with whitelist + short URL detection)
    try {
      const handled = await antilinkCmd.check(sock, msg, from, groupSettings);
      if (handled) return;
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

    // ── v7.0 AntiBadWord ────────────────────────────────────────────────────
    try {
      if (!isAdmin && !isOwner(senderNorm)) {
        const handled = await antibadwordCmd.check(sock, msg, from, groupSettings);
        if (handled) return;
      }
    } catch {}

    // ── v7.0 AntiFWD (block forwarded messages) ─────────────────────────────
    try {
      if (!isAdmin && !isOwner(senderNorm)) {
        const handled = await antifwdCmd.check(sock, msg, from, groupSettings);
        if (handled) return;
      }
    } catch {}

    // ── v7.0 AntiSpam (rate limiter) ────────────────────────────────────────
    try {
      if (!isAdmin && !isOwner(senderNorm)) {
        const handled = await antispamCmd.check(sock, msg, from, groupSettings);
        if (handled) return;
      }
    } catch {}

    // ── v5.2 Anti-Flood ─────────────────────────────────────────────────────
    try {
      if (!isAdmin && !isOwner(senderNorm)) {
        const handled = await antifloodCmd.check(sock, msg, from, groupSettings);
        if (handled) return;
      }
    } catch {}

    // ── v5.2 Auto-Reply Keywords ─────────────────────────────────────────────
    try {
      await autoreplykwCmd.check(sock, msg, from, body);
    } catch {}

    // ── v5.2 Auto-Kick (silent join) — clear pending kick when member speaks ─
    try {
      autokickCmd.clearKick(from, senderNorm);
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

  // ── Non-group: PM Blocker (v5) ───────────────────────────────────────────
  if (!isGroup && !isCmd) {
    // ── v5.3 WA Account Protection — scam/flood DM blocker ────────────────
    try {
      const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
      const ownerJid = `${ownerNum}@s.whatsapp.net`;
      const blocked  = await waprotectCmd.checkDMProtection(sock, msg, from, body, senderNorm, ownerJid);
      if (blocked) return;
    } catch {}
    // PM blocker
    if (pmblockerCmd.pmState?.enabled) {
      try {
        await sock.sendMessage(from, { text: pmblockerCmd.pmState.message || '⚠️ DMs are blocked.' });
      } catch {}
      return;
    }
    // ── v5.3 Auto PM Reply (away mode) ───────────────────────────────────────
    try {
      const handled = await autoreplyCmd.checkAutoPM(sock, msg, from, body);
      if (handled) return;
    } catch {}
    // Autochat
    const gs = database.getGroupSettings(from);
    if (gs?.autochat !== false) {
      try { await autochatCmd.handleMessage?.(sock, msg, from, sender, body, gs); } catch {}
    }
    return;
  }

  if (!isCmd) return;

  // ── Ban check — silently ignore banned users ──────────────────────────────
  if (!isOwner(senderNorm) && isBanned(senderNorm)) return;

  // ── Maintenance / Owner mode gate ─────────────────────────────────────────
  if (!isOwner(senderNorm)) {
    const modeState = getModeState();
    if (modeState.ownerMode) {
      return reply('🔒 Bot is in *owner-only mode*. Commands are restricted.');
    }
    if (modeState.maintenance) {
      return reply(modeState.message || '🔧 Bot is under maintenance. Please wait.');
    }
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  if (!isOwner(senderNorm) && isRateLimited(senderNorm)) {
    return sock.sendMessage(from, { text: config.messages.rateLimited }, { quoted: msg });
  }

  // ── Typing indicator (unless ghost mode) ─────────────────────────────────
  if (!groupSettings.ghostMode || autotypingCmd.autotypingState?.enabled) {
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
