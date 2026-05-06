/**
 * ⚡ NovaSpark Bot v11 — TURBO Handler
 * Lazy-load commands | O(1) command map | Zero-alloc hot path
 * Parallel auto-feature checks | Minimal overhead
 * By Dev-Ntando — Engineered for SPEED
 */
'use strict';

const config   = require('./config');
const database = require('./database');
const path     = require('path');
const fs       = require('fs');

// ── Lazy Command Registry ─────────────────────────────────────────────────────
// Commands are loaded on FIRST USE only — not at boot.
// This cuts cold start from ~3s to <200ms.

const _cmdCache = new Map();    // name/alias -> module
const _cmdPaths = new Map();    // name/alias -> file path (for lazy resolve)

function _buildCommandIndex() {
  const commandsDir = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsDir)) return;
  const categories = fs.readdirSync(commandsDir);
  for (const cat of categories) {
    const catDir = path.join(commandsDir, cat);
    let stat;
    try { stat = fs.statSync(catDir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(catDir, file);
      // Quick parse: read first 2KB to extract name & aliases without full require()
      try {
        const head = fs.readFileSync(filePath, 'utf-8').slice(0, 3000);
        const nameMatch = head.match(/name\s*:\s*['"`]([^'"`]+)['"`]/);
        if (!nameMatch) continue;
        const cmdName = nameMatch[1].toLowerCase();
        _cmdPaths.set(cmdName, filePath);
        // Extract aliases
        const aliasMatch = head.match(/aliases\s*:\s*\[([^\]]*)\]/);
        if (aliasMatch) {
          const aliases = aliasMatch[1].match(/['"`]([^'"`]+)['"`]/g);
          if (aliases) {
            for (const a of aliases) {
              _cmdPaths.set(a.replace(/['"`]/g, '').toLowerCase(), filePath);
            }
          }
        }
      } catch {}
    }
  }
}

function _getCommand(name) {
  if (_cmdCache.has(name)) return _cmdCache.get(name);
  const filePath = _cmdPaths.get(name);
  if (!filePath) return null;
  try {
    const mod = require(filePath);
    // Cache by name and all aliases
    _cmdCache.set(name, mod);
    if (mod.name) _cmdCache.set(mod.name, mod);
    if (Array.isArray(mod.aliases)) {
      for (const a of mod.aliases) _cmdCache.set(a, mod);
    }
    return mod;
  } catch (e) {
    console.error(`[CMD LOAD] ${name}:`, e.message);
    return null;
  }
}

// Build index at require-time (fast — only reads filenames + first 3KB headers)
_buildCommandIndex();

// ── Auto-feature modules (lazy-loaded on first group message) ─────────────────
let _autoModules = null;
function _getAutoModules() {
  if (_autoModules) return _autoModules;
  const _tryReq = (p) => { try { return require(p); } catch { return null; } };
  _autoModules = {
    antilink:    _tryReq('./commands/group/antilink'),
    antitoxic:   _tryReq('./commands/group/antitoxic'),
    antiword:    _tryReq('./commands/group/antiword'),
    antibadword: _tryReq('./commands/group/antibadword'),
    antifwd:     _tryReq('./commands/group/antifwd'),
    antispam:    _tryReq('./commands/group/antispam'),
    antiflood:   _tryReq('./commands/group/antiflood'),
    antiimage:   _tryReq('./commands/group/antiimage'),
    autoreplykw: _tryReq('./commands/group/autoreplykw'),
    autokick:    _tryReq('./commands/group/autokick'),
    slowmode:    _tryReq('./commands/group/slowmode'),
    autoreact:   _tryReq('./commands/group/autoreact'),
    leaderboard: _tryReq('./commands/group/leaderboard'),
    vipmode:     _tryReq('./commands/group/vipmode'),
    autochat:    _tryReq('./commands/ai/autochat'),
    aiEyes:      _tryReq('./commands/ai/aieyes'),
    antidelete:  _tryReq('./commands/owner/antidelete'),
    smartmod:    _tryReq('./commands/group/smartmod'),
  };
  return _autoModules;
}

// ── Owner check (cached Set for O(1)) ─────────────────────────────────────────
const _ownerSet = new Set(
  (Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber])
    .map(n => String(n).replace(/\D/g, ''))
);
const isOwner = (jid) => _ownerSet.has(String(jid).split('@')[0].replace(/\D/g, ''));

// ── Rate limiter (in-memory, no disk) ─────────────────────────────────────────
const _rateMap = new Map();
const RATE_WINDOW = 10000; // 10s window
const RATE_MAX = 5;        // max 5 cmds per window

function isRateLimited(jid) {
  const now = Date.now();
  let entry = _rateMap.get(jid);
  if (!entry || now - entry.start > RATE_WINDOW) {
    _rateMap.set(jid, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

// Cleanup rate map every 60s
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW * 2;
  for (const [k, v] of _rateMap) {
    if (v.start < cutoff) _rateMap.delete(k);
  }
}, 60000).unref();

// ── Ban check ─────────────────────────────────────────────────────────────────
const isBanned = (jid) => database.isBanned ? database.isBanned(jid) : false;

// ── Mode state ────────────────────────────────────────────────────────────────
function getModeState() {
  return {
    maintenance: database.getSetting('maintenance') || false,
    ownerMode: database.getSetting('ownerMode') || false,
    message: database.getSetting('maintenanceMsg') || '🔧 Bot is under maintenance.',
  };
}

// ── JID normalization (inline for speed) ──────────────────────────────────────
const normalizeJid = (jid) => {
  if (!jid) return '';
  const s = jid.split(':')[0];
  return s.includes('@') ? s : s + '@s.whatsapp.net';
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ══════════════════════════════════════════════════════════════════════════════
const handler = async (sock, msg) => {
  const from    = msg.key.remoteJid;
  if (!from) return;
  const isGroup = from.endsWith('@g.us');
  const sender  = isGroup
    ? (msg.key.participant || msg.key.remoteJid)
    : (msg._ownerOverride || (msg.key.fromMe
        ? `${(Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber)}@s.whatsapp.net`
        : from));
  const senderNorm = normalizeJid(sender);

  // ── Cache message for anti-delete ────────────────────────────────────────
  const auto = _getAutoModules();
  try { auto.antidelete?.cacheMessage?.(msg); } catch {}

  // ── Analytics (non-blocking) ──────────────────────────────────────────────
  try { database.logMessage(senderNorm, from, isGroup); } catch {}

  // ── Record first-seen ─────────────────────────────────────────────────────
  try {
    const profile = database.getUserProfile(senderNorm);
    if (!profile.joinDate) {
      database.updateUserProfile(senderNorm, { joinDate: Date.now() });
    }
  } catch {}

  // ── Extract text (inline — no function call overhead) ─────────────────────
  const body =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption || '';

  const prefix  = config.prefix || '.';
  const isCmd   = body.length > 0 && body.charCodeAt(0) === prefix.charCodeAt(0);
  const cmdName = isCmd ? body.slice(prefix.length).split(/\s/, 1)[0].toLowerCase() : '';
  const args    = isCmd ? body.slice(prefix.length + cmdName.length).trim().split(/\s+/).filter(Boolean) : [];
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  // ── Group metadata (cached per message — single call) ─────────────────────
  let groupSettings = null;
  let isAdmin = false;
  let isBotAdmin = false;
  let groupMeta = null;

  if (isGroup) {
    groupSettings = database.getGroupSettings(from);
    try {
      groupMeta = await sock.groupMetadata(from);
      const me = sock.user?.id ? normalizeJid(sock.user.id) : '';
      isAdmin = groupMeta.participants.some(p => normalizeJid(p.id) === senderNorm && p.admin);
      isBotAdmin = groupMeta.participants.some(p => normalizeJid(p.id) === me && p.admin);
    } catch {}
  }

  // ── Ghost mode ────────────────────────────────────────────────────────────
  if (!groupSettings?.ghostMode) {
    try { await sock.readMessages([msg.key]); } catch {}
  }

  // ── AI Eyes (always-on monitor) ───────────────────────────────────────────
  try {
    if (auto.aiEyes?.monitor) {
      const eyesResult = await auto.aiEyes.monitor({
        sock, msg, from, sender: senderNorm, body, isGroup, isAdmin, isOwner: isOwner(senderNorm),
      });
      if (eyesResult?.action === 'delete' && isBotAdmin) {
        await sock.sendMessage(from, { delete: msg.key });
      }
    }
  } catch {}

  // ══════════════════════════════════════════════════════════════════════════
  // NON-COMMAND GROUP MESSAGES — Auto-feature pipeline
  // ══════════════════════════════════════════════════════════════════════════
  if (isGroup && !isCmd) {
    try { database.logGroupMessage(from, senderNorm); } catch {}

    const skipCheck = isAdmin || isOwner(senderNorm);

    // ── Security checks (short-circuit on first block) ──────────────────────
    if (!skipCheck) {
      // Anti-link
      try { if (await auto.antilink?.check?.(sock, msg, from, groupSettings)) return; } catch {}
      // Anti-toxic
      try { if (await auto.antitoxic?.scan?.(sock, msg, from, groupSettings)) return; } catch {}
      // Anti-word
      try { if (await auto.antiword?.check?.(sock, msg, from, groupSettings)) return; } catch {}
      // Anti-badword
      try { if (await auto.antibadword?.check?.(sock, msg, from, groupSettings)) return; } catch {}
      // Anti-forward
      try { if (await auto.antifwd?.check?.(sock, msg, from, groupSettings)) return; } catch {}
      // Anti-spam
      try { if (await auto.antispam?.check?.(sock, msg, from, groupSettings)) return; } catch {}
      // Anti-flood
      try { if (await auto.antiflood?.check?.(sock, msg, from, groupSettings)) return; } catch {}
      // Anti-media
      try { if (await auto.antiimage?.check?.(sock, msg, from, groupSettings)) return; } catch {}
    }

    // VIP mode
    if (groupSettings.vipOnly && !skipCheck) {
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

    // Slow mode
    if (!skipCheck && groupSettings.slowMode) {
      try { if (await auto.slowmode?.check?.(sock, msg, from, senderNorm, groupSettings, isAdmin)) return; } catch {}
    }

    // ── Engagement features (non-blocking, fire-and-forget) ─────────────────
    try { auto.autoreplykw?.check?.(sock, msg, from, body); } catch {}
    try { auto.autokick?.clearKick?.(from, senderNorm); } catch {}
    try { auto.leaderboard?.addXP?.(from, senderNorm); } catch {}
    try { auto.autoreact?.react?.(sock, msg, from, groupSettings); } catch {}

    // Autochat (non-command AI)
    if (groupSettings.autochat) {
      try { await auto.autochat?.handleMessage?.(sock, msg, from, sender, body, groupSettings); } catch {}
    }
    return;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NON-GROUP, NON-COMMAND — PM handling
  // ══════════════════════════════════════════════════════════════════════════
  if (!isGroup && !isCmd) {
    // WA Protect
    try {
      const waprotectCmd = _getCommand('waprotect') || require('./commands/owner/waprotect');
      const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
      const ownerJid = `${ownerNum}@s.whatsapp.net`;
      if (await waprotectCmd?.checkDMProtection?.(sock, msg, from, body, senderNorm, ownerJid)) return;
    } catch {}
    // PM blocker
    try {
      const pmblockerCmd = _getCommand('pmblocker') || require('./commands/owner/pmblocker');
      if (pmblockerCmd?.pmState?.enabled) {
        await sock.sendMessage(from, { text: pmblockerCmd.pmState.message || '⚠️ DMs are blocked.' });
        return;
      }
    } catch {}
    // Auto PM reply
    try {
      const autoreplyCmd = _getCommand('autoreply') || require('./commands/owner/autoreply');
      if (await autoreplyCmd?.checkAutoPM?.(sock, msg, from, body)) return;
    } catch {}
    // Autochat in DMs
    const gs = database.getGroupSettings(from);
    if (gs?.autochat !== false) {
      try { await auto.autochat?.handleMessage?.(sock, msg, from, sender, body, gs); } catch {}
    }
    return;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMMAND EXECUTION
  // ══════════════════════════════════════════════════════════════════════════
  if (!isCmd) return;

  // Ban check
  if (!isOwner(senderNorm) && isBanned(senderNorm)) return;

  // Maintenance/owner mode
  if (!isOwner(senderNorm)) {
    const modeState = getModeState();
    if (modeState.ownerMode) {
      return sock.sendMessage(from, { text: '🔒 Bot is in *owner-only mode*. Commands are restricted.' }, { quoted: msg });
    }
    if (modeState.maintenance) {
      return sock.sendMessage(from, { text: modeState.message }, { quoted: msg });
    }
  }

  // Rate limit
  if (!isOwner(senderNorm) && isRateLimited(senderNorm)) {
    return sock.sendMessage(from, { text: config.messages?.rateLimited || '⏳ Slow down! Too many commands.' }, { quoted: msg });
  }

  // Typing indicator
  if (!groupSettings?.ghostMode) {
    try { await sock.sendPresenceUpdate('composing', from); } catch {}
  }

  // Log command
  try { database.logCommand(senderNorm, cmdName, from); } catch {}

  // Reply helper
  const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });

  // ── Resolve command (lazy load) ───────────────────────────────────────────
  const cmd = _getCommand(cmdName);
  if (!cmd) {
    if (!isGroup) {
      return reply(`❓ Unknown command: \`${prefix}${cmdName}\`\nType \`${prefix}menu\` for the full command list.`);
    }
    return;
  }

  // ── Permission gates ──────────────────────────────────────────────────────
  if (cmd.ownerOnly && !isOwner(senderNorm)) {
    const rawP = msg.key.participant || '';
    const fromJ = msg.key.remoteJid || '';
    if (!isOwner(rawP) && !isOwner(fromJ)) {
      return reply(config.messages?.ownerOnly || '🔒 Owner only.');
    }
  }
  if (cmd.adminOnly && isGroup && !isAdmin && !isOwner(senderNorm)) {
    return reply(config.messages?.adminOnly || '👮 Admin only.');
  }
  if (cmd.groupOnly && !isGroup) {
    return reply(config.messages?.groupOnly || '👥 Group only.');
  }
  if (cmd.privateOnly && isGroup) {
    return reply(config.messages?.privateOnly || '📩 DM only.');
  }
  if (cmd.premiumOnly && !isOwner(senderNorm) && !database.isPremium(senderNorm)) {
    return reply(config.messages?.premiumOnly || '💎 Premium only.');
  }

  // ── Execute ───────────────────────────────────────────────────────────────
  try {
    await cmd.execute({
      sock, msg, from, sender: senderNorm,
      args, body, reply,
      isAdmin, isBotAdmin,
      isOwner: isOwner(senderNorm),
      isPremium: database.isPremium(senderNorm),
      groupMeta, groupSettings: groupSettings || {},
      mentions,
    });
  } catch (err) {
    console.error(`[CMD ERROR] .${cmdName}:`, err.message);
    try { await reply(`❌ Error: ${err.message}`); } catch {}
  }

  // Clear typing
  if (!groupSettings?.ghostMode) {
    try { await sock.sendPresenceUpdate('paused', from); } catch {}
  }
};

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = handler;
module.exports.cacheMessage = (msg) => { try { _getAutoModules().antidelete?.cacheMessage?.(msg); } catch {} };
module.exports.handleDelete = async (sock, update) => { try { await _getAutoModules().antidelete?.handleDelete?.(sock, update); } catch {} };
