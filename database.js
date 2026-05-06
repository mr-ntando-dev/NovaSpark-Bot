/**
 * ⚡ NovaSpark Bot v11 — TURBO Database Engine
 * In-memory cache + async flush | Zero blocking I/O
 * Debounced writes | Atomic file ops
 * By Dev-Ntando — Optimized for SPEED
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const DB_PATH      = path.join(__dirname, 'database');
const GROUPS_DB    = path.join(DB_PATH, 'groups.json');
const USERS_DB     = path.join(DB_PATH, 'users.json');
const PREMIUM_DB   = path.join(DB_PATH, 'premium.json');
const REMIND_DB    = path.join(DB_PATH, 'reminders.json');
const ANALYTICS_DB = path.join(DB_PATH, 'analytics.json');
const PROFILE_DB   = path.join(DB_PATH, 'profiles.json');
const SETTINGS_DB  = path.join(DB_PATH, 'settings.json');
const MEMORY_DB    = path.join(DB_PATH, 'memory.json');
const WARNS_DB     = path.join(DB_PATH, 'warns.json');
const GROUP_STATS  = path.join(DB_PATH, 'group_stats.json');
const USER_STATS   = path.join(DB_PATH, 'user_stats.json');

if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

// ── In-Memory Cache Layer ─────────────────────────────────────────────────────
const _cache = new Map();
const _dirty = new Set();
let _flushTimer = null;

const FLUSH_INTERVAL = 5000; // flush every 5s (batch writes)

function _loadFile(f, fallback) {
  if (_cache.has(f)) return _cache.get(f);
  let data = fallback;
  try {
    if (fs.existsSync(f)) {
      data = JSON.parse(fs.readFileSync(f, 'utf-8'));
    }
  } catch { data = fallback; }
  _cache.set(f, data);
  return data;
}

function _markDirty(f) {
  _dirty.add(f);
  if (!_flushTimer) {
    _flushTimer = setTimeout(_flushAll, FLUSH_INTERVAL);
    if (_flushTimer.unref) _flushTimer.unref();
  }
}

function _flushAll() {
  _flushTimer = null;
  for (const f of _dirty) {
    const data = _cache.get(f);
    if (data === undefined) continue;
    const tmp = f + '.tmp';
    try {
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
      fs.renameSync(tmp, f);
    } catch (e) {
      console.error('[DB FLUSH]', f, e.message);
      try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {}
    }
  }
  _dirty.clear();
}

// Flush on exit
process.on('exit', _flushAll);
process.on('SIGINT', () => { _flushAll(); process.exit(); });
process.on('SIGTERM', () => { _flushAll(); process.exit(); });

// Init files
const initDB = (f, d) => { if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(d, null, 2)); };
[GROUPS_DB, USERS_DB, ANALYTICS_DB, PROFILE_DB, SETTINGS_DB, MEMORY_DB, WARNS_DB, GROUP_STATS, USER_STATS].forEach(f => initDB(f, {}));
initDB(PREMIUM_DB, { users: [] });
initDB(REMIND_DB, []);

// Preload hot databases into memory
_loadFile(GROUPS_DB, {});
_loadFile(PREMIUM_DB, { users: [] });
_loadFile(PROFILE_DB, {});
_loadFile(SETTINGS_DB, {});
_loadFile(WARNS_DB, {});

// ── Helpers (backward compat) ─────────────────────────────────────────────────
const readDB  = (f) => _loadFile(f, f === REMIND_DB ? [] : {});
const writeDB = (f, d) => { _cache.set(f, d); _markDirty(f); return true; };

// ── Group Settings (HOT PATH — fully cached) ─────────────────────────────────
const config = require('./config');
const getGroupSettings = (gid) => {
  const db = _loadFile(GROUPS_DB, {});
  if (!db[gid]) { db[gid] = { ...config.defaultGroupSettings }; _markDirty(GROUPS_DB); }
  return db[gid];
};
const updateGroupSettings = (gid, s) => {
  const db = _loadFile(GROUPS_DB, {});
  db[gid] = { ...(db[gid] || {}), ...s };
  _markDirty(GROUPS_DB);
};
const getAllGroupSettings = () => _loadFile(GROUPS_DB, {});

// ── User Profile ──────────────────────────────────────────────────────────────
const getUserProfile = (jid) => {
  const db = _loadFile(PROFILE_DB, {});
  return db[jid] || {};
};
const updateUserProfile = (jid, data) => {
  const db = _loadFile(PROFILE_DB, {});
  db[jid] = { ...(db[jid] || {}), ...data };
  _markDirty(PROFILE_DB);
};

// ── Premium (cached Set for O(1) lookup) ──────────────────────────────────────
let _premiumSet = null;
function _getPremiumSet() {
  if (!_premiumSet) {
    const db = _loadFile(PREMIUM_DB, { users: [] });
    _premiumSet = new Set((db.users || []).map(u => u.split('@')[0]));
  }
  return _premiumSet;
}
const isPremium = (jid) => _getPremiumSet().has(jid.split('@')[0]);
const addPremium = (jid) => {
  const db = _loadFile(PREMIUM_DB, { users: [] });
  if (!db.users.includes(jid)) db.users.push(jid);
  _premiumSet = null; // invalidate
  _markDirty(PREMIUM_DB);
};
const removePremium = (jid) => {
  const db = _loadFile(PREMIUM_DB, { users: [] });
  db.users = db.users.filter(u => u !== jid);
  _premiumSet = null;
  _markDirty(PREMIUM_DB);
};
const listPremium = () => (_loadFile(PREMIUM_DB, { users: [] }).users || []);

// ── Settings ──────────────────────────────────────────────────────────────────
const getSetting = (key) => _loadFile(SETTINGS_DB, {})[key];
const setSetting = (key, val) => {
  const db = _loadFile(SETTINGS_DB, {});
  db[key] = val;
  _markDirty(SETTINGS_DB);
};

// ── Warns ─────────────────────────────────────────────────────────────────────
const getWarns = (gid, jid) => (_loadFile(WARNS_DB, {})[gid]?.[jid] || []);
const addWarn = (gid, jid, reason = '') => {
  const db = _loadFile(WARNS_DB, {});
  if (!db[gid]) db[gid] = {};
  if (!db[gid][jid]) db[gid][jid] = [];
  db[gid][jid].push({ reason, time: Date.now() });
  _markDirty(WARNS_DB);
  return db[gid][jid].length;
};
const clearWarns = (gid, jid) => {
  const db = _loadFile(WARNS_DB, {});
  if (db[gid]) delete db[gid][jid];
  _markDirty(WARNS_DB);
};

// ── Reminders ─────────────────────────────────────────────────────────────────
const addReminder = (r) => {
  const db = _loadFile(REMIND_DB, []);
  db.push(r);
  _markDirty(REMIND_DB);
};
const getPendingReminders = () => {
  const db = _loadFile(REMIND_DB, []);
  const now = Date.now();
  return db.filter(r => !r.done && now >= r.triggerAt);
};
const markReminderDone = (id) => {
  const db = _loadFile(REMIND_DB, []);
  const r = db.find(x => x.id === id);
  if (r) { r.done = true; _markDirty(REMIND_DB); }
};

// ── Memory ────────────────────────────────────────────────────────────────────
const getMemory = (jid) => (_loadFile(MEMORY_DB, {})[jid] || []);
const setMemory = (jid, mem) => {
  const db = _loadFile(MEMORY_DB, {});
  db[jid] = mem;
  _markDirty(MEMORY_DB);
};

// ── Analytics (fire-and-forget, debounced) ────────────────────────────────────
const logMessage = (sender, chat, isGroup) => {
  const db = _loadFile(ANALYTICS_DB, {});
  const today = new Date().toISOString().slice(0, 10);
  if (!db[today]) db[today] = { messages: 0, commands: 0, users: [], groups: [] };
  db[today].messages++;
  if (sender && !db[today].users.includes(sender)) db[today].users.push(sender);
  if (isGroup && chat && !db[today].groups.includes(chat)) db[today].groups.push(chat);
  _markDirty(ANALYTICS_DB);
};
const logCommand = (sender, cmd, chat) => {
  const db = _loadFile(ANALYTICS_DB, {});
  const today = new Date().toISOString().slice(0, 10);
  if (!db[today]) db[today] = { messages: 0, commands: 0, users: [], groups: [] };
  db[today].commands++;
  _markDirty(ANALYTICS_DB);
};
const getAnalytics = (date) => {
  const db = _loadFile(ANALYTICS_DB, {});
  return date ? db[date] : db;
};

// ── Group Stats (message counts per group per user) ───────────────────────────
const logGroupMessage = (gid, sender) => {
  const db = _loadFile(GROUP_STATS, {});
  if (!db[gid]) db[gid] = {};
  db[gid][sender] = (db[gid][sender] || 0) + 1;
  _markDirty(GROUP_STATS);
};
const getGroupStats = (gid) => (_loadFile(GROUP_STATS, {})[gid] || {});

// ── User Stats ────────────────────────────────────────────────────────────────
const getUserStats = (jid) => (_loadFile(USER_STATS, {})[jid] || { messages: 0, commands: 0 });
const updateUserStats = (jid, data) => {
  const db = _loadFile(USER_STATS, {});
  db[jid] = { ...(db[jid] || { messages: 0, commands: 0 }), ...data };
  _markDirty(USER_STATS);
};

// ── Bans ──────────────────────────────────────────────────────────────────────
const getBanned = () => getSetting('banned') || [];
const banUser = (jid) => {
  const list = getBanned();
  if (!list.includes(jid)) { list.push(jid); setSetting('banned', list); }
};
const unbanUser = (jid) => {
  setSetting('banned', getBanned().filter(u => u !== jid));
};
const isBanned = (jid) => getBanned().includes(jid);

// ── Force flush (for critical writes) ─────────────────────────────────────────
const flush = () => _flushAll();

module.exports = {
  getGroupSettings, updateGroupSettings, getAllGroupSettings,
  getUserProfile, updateUserProfile,
  isPremium, addPremium, removePremium, listPremium,
  getSetting, setSetting,
  getWarns, addWarn, clearWarns,
  addReminder, getPendingReminders, markReminderDone,
  getMemory, setMemory,
  logMessage, logCommand, getAnalytics,
  logGroupMessage, getGroupStats,
  getUserStats, updateUserStats,
  getBanned, banUser, unbanUser, isBanned,
  flush,
  // backward compat
  readDB, writeDB,
};
