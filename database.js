/**
 * ⚡ NovaSpark Bot v4 — Enhanced JSON Database
 * Handles groups, users, premium, reminders, analytics, profiles, VIP.
 * By Dev-Ntando
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

const initDB = (f, d = {}) => { if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(d, null, 2)); };
[GROUPS_DB, USERS_DB, ANALYTICS_DB, PROFILE_DB, SETTINGS_DB, MEMORY_DB, WARNS_DB, GROUP_STATS, USER_STATS].forEach(f => initDB(f, {}));
initDB(PREMIUM_DB, { users: [] });
initDB(REMIND_DB, []);

const readDB  = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf-8')); } catch { return f === REMIND_DB ? [] : {}; } };
const writeDB = (f, d) => {
  const tmp = f + '.tmp';
  try { fs.writeFileSync(tmp, JSON.stringify(d, null, 2)); fs.renameSync(tmp, f); return true; }
  catch (e) { console.error('DB write error:', e.message); try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {} return false; }
};

// ── Group Settings ────────────────────────────────────────────────────────────
const config = require('./config');
const getGroupSettings = (gid) => {
  const db = readDB(GROUPS_DB);
  if (!db[gid]) { db[gid] = { ...config.defaultGroupSettings }; writeDB(GROUPS_DB, db); }
  return db[gid];
};
const updateGroupSettings = (gid, s) => {
  const db = readDB(GROUPS_DB);
  db[gid]  = { ...db[gid], ...s };
  writeDB(GROUPS_DB, db);
};
const getAllGroupSettings = () => readDB(GROUPS_DB);

// ── User Profile ──────────────────────────────────────────────────────────────
const getUserProfile = (jid) => {
  const db = readDB(PROFILE_DB);
  return db[jid] || {};
};
const updateUserProfile = (jid, data) => {
  const db = readDB(PROFILE_DB);
  db[jid]  = { ...db[jid], ...data };
  writeDB(PROFILE_DB, db);
};

// ── Premium ───────────────────────────────────────────────────────────────────
const isPremium = (jid) => {
  const db = readDB(PREMIUM_DB);
  const num = jid.split('@')[0];
  return (db.users || []).some(u => u === jid || u === num);
};
const addPremium    = (jid) => { const db = readDB(PREMIUM_DB); if (!db.users.includes(jid)) db.users.push(jid); writeDB(PREMIUM_DB, db); };
const removePremium = (jid) => { const db = readDB(PREMIUM_DB); db.users = db.users.filter(u => u !== jid); writeDB(PREMIUM_DB, db); };
const listPremium   = ()    => readDB(PREMIUM_DB).users || [];

// ── Settings (global) ─────────────────────────────────────────────────────────
const getSetting    = (key)        => { const db = readDB(SETTINGS_DB); return db[key]; };
const setSetting    = (key, val)   => { const db = readDB(SETTINGS_DB); db[key] = val; writeDB(SETTINGS_DB, db); };

// ── Warns ─────────────────────────────────────────────────────────────────────
const getWarns  = (gid, jid) => { const db = readDB(WARNS_DB); return db[gid]?.[jid] || []; };
const addWarn   = (gid, jid, reason = '') => {
  const db = readDB(WARNS_DB);
  if (!db[gid]) db[gid] = {};
  if (!db[gid][jid]) db[gid][jid] = [];
  db[gid][jid].push({ reason, time: Date.now() });
  writeDB(WARNS_DB, db);
  return db[gid][jid].length;
};
const clearWarns = (gid, jid) => {
  const db = readDB(WARNS_DB);
  if (db[gid]) delete db[gid][jid];
  writeDB(WARNS_DB, db);
};

// ── Reminders ─────────────────────────────────────────────────────────────────
const addReminder         = (r) => { const db = readDB(REMIND_DB); db.push(r); writeDB(REMIND_DB, db); };
const getPendingReminders = ()  => { const db = readDB(REMIND_DB); return db.filter(r => !r.done && Date.now() >= r.triggerAt); };
const markReminderDone    = (id)=> { const db = readDB(REMIND_DB); const r = db.find(x => x.id === id); if (r) { r.done = true; writeDB(REMIND_DB, db); } };

// ── Conversation Memory ───────────────────────────────────────────────────────
const getMemory    = (jid) => { const db = readDB(MEMORY_DB); return db[jid] || []; };
const setMemory    = (jid, mem) => { const db = readDB(MEMORY_DB); db[jid] = mem; writeDB(MEMORY_DB, db); };
const clearMemory  = (jid) => { const db = readDB(MEMORY_DB); delete db[jid]; writeDB(MEMORY_DB, db); };

// ── Analytics ─────────────────────────────────────────────────────────────────
const logCommand = (jid, cmd, gid) => {
  // user stats
  const us = readDB(USER_STATS);
  if (!us[jid]) us[jid] = { commandCount: 0, messageCount: 0 };
  us[jid].commandCount = (us[jid].commandCount || 0) + 1;
  writeDB(USER_STATS, us);
  // group stats
  if (gid) {
    const gs = readDB(GROUP_STATS);
    if (!gs[gid]) gs[gid] = { commandCount: 0, messageCount: 0, chatters: {} };
    gs[gid].commandCount = (gs[gid].commandCount || 0) + 1;
    writeDB(GROUP_STATS, gs);
  }
};
const logMessage = (jid, gid, isGroup) => {
  const us = readDB(USER_STATS);
  if (!us[jid]) us[jid] = { commandCount: 0, messageCount: 0 };
  us[jid].messageCount = (us[jid].messageCount || 0) + 1;
  writeDB(USER_STATS, us);
};
const logGroupMessage = (gid, jid) => {
  const gs = readDB(GROUP_STATS);
  if (!gs[gid]) gs[gid] = { commandCount: 0, messageCount: 0, chatters: {} };
  gs[gid].messageCount = (gs[gid].messageCount || 0) + 1;
  gs[gid].chatters[jid] = (gs[gid].chatters[jid] || 0) + 1;
  writeDB(GROUP_STATS, gs);
};
const getGroupAnalytics  = (gid) => readDB(GROUP_STATS)[gid] || {};
const getUserAnalytics   = (jid) => readDB(USER_STATS)[jid]  || {};

// ── Profile helpers (aliases used by many commands) ───────────────────────────
// getProfile / saveProfile / hasProfile all map to the PROFILE_DB
// keys are bare phone numbers (without @s.whatsapp.net) or full JIDs — we normalise
const _profileKey = (jid) => (jid || '').replace(/@.*$/, '');

const hasProfile = (jid) => {
  const db  = readDB(PROFILE_DB);
  const key = _profileKey(jid);
  return !!(db[key] && Object.keys(db[key]).length);
};

const getProfile = (jid) => {
  const db  = readDB(PROFILE_DB);
  const key = _profileKey(jid);
  return db[key] || null;
};

const saveProfile = (jid, data) => {
  const db  = readDB(PROFILE_DB);
  const key = _profileKey(jid);
  db[key]   = { ...(db[key] || {}), ...data, updatedAt: Date.now() };
  writeDB(PROFILE_DB, db);
};

// ── Analytics alias ───────────────────────────────────────────────────────────
// getAnalytics(jid) — rich per-user analytics object used by .mystats
const getAnalytics = (jid) => {
  const key  = _profileKey(jid);
  const us   = readDB(USER_STATS);
  const data = us[key] || us[`${key}@s.whatsapp.net`] || {};
  return {
    total:      data.commandCount || 0,
    messages:   data.messageCount || 0,
    commands:   data.commandMap   || {},
    firstSeen:  data.firstSeen    || null,
    lastSeen:   data.lastSeen     || null,
  };
};

// Enrich logCommand to also track per-command map + timestamps
const _origLogCommand = logCommand;
const logCommandRich = (jid, cmd, gid) => {
  _origLogCommand(jid, cmd, gid);
  const key = _profileKey(jid);
  const us  = readDB(USER_STATS);
  if (!us[key]) us[key] = { commandCount: 0, messageCount: 0, commandMap: {} };
  if (!us[key].commandMap) us[key].commandMap = {};
  us[key].commandMap[cmd] = (us[key].commandMap[cmd] || 0) + 1;
  if (!us[key].firstSeen) us[key].firstSeen = Date.now();
  us[key].lastSeen = Date.now();
  writeDB(USER_STATS, us);
};

// ── Group stats alias ─────────────────────────────────────────────────────────
const getGroupStats = (gid) => readDB(GROUP_STATS)[gid] || {};

// ── User reminders ────────────────────────────────────────────────────────────
const getUserReminders = (jid) => {
  const key = _profileKey(jid);
  const db  = readDB(REMIND_DB);
  return db.filter(r => !r.done && (r.userId === key || r.userId === jid));
};

// ── Autokick DB (new auto-feature) ────────────────────────────────────────────
const AUTOKICK_DB = path.join(DB_PATH, 'autokick.json');
initDB(AUTOKICK_DB, {});
const getAutokickSettings = (gid) => { const db = readDB(AUTOKICK_DB); return db[gid] || {}; };
const setAutokickSettings = (gid, s) => { const db = readDB(AUTOKICK_DB); db[gid] = { ...db[gid], ...s }; writeDB(AUTOKICK_DB, db); };

// ── Anti-Flood DB (new auto-feature) ─────────────────────────────────────────
const FLOOD_DB = path.join(DB_PATH, 'flood.json');
initDB(FLOOD_DB, {});
const getFloodSettings = (gid) => { const db = readDB(FLOOD_DB); return db[gid] || {}; };
const setFloodSettings = (gid, s) => { const db = readDB(FLOOD_DB); db[gid] = { ...db[gid], ...s }; writeDB(FLOOD_DB, db); };

// ── Flood tracker (in-memory, resets every minute) ────────────────────────────
const _floodTracker = new Map(); // key: `${gid}:${jid}` → { count, reset }
const trackFlood = (gid, jid) => {
  const key  = `${gid}:${jid}`;
  const now  = Date.now();
  const entry = _floodTracker.get(key) || { count: 0, reset: now + 10000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 10000; }
  entry.count++;
  _floodTracker.set(key, entry);
  return entry.count;
};

// ── Poll DB ───────────────────────────────────────────────────────────────────
const POLL_DB = path.join(DB_PATH, 'polls.json');
initDB(POLL_DB, {});
const savePoll   = (id, data) => { const db = readDB(POLL_DB); db[id] = data; writeDB(POLL_DB, db); };
const getPoll    = (id)       => { const db = readDB(POLL_DB); return db[id] || null; };
const deletePoll = (id)       => { const db = readDB(POLL_DB); delete db[id]; writeDB(POLL_DB, db); };

module.exports = {
  // group
  getGroupSettings, updateGroupSettings, getAllGroupSettings,
  // user profile
  getUserProfile, updateUserProfile,
  hasProfile, getProfile, saveProfile,
  // premium
  isPremium, addPremium, removePremium, listPremium,
  // settings
  getSetting, setSetting,
  // warns
  getWarns, addWarn, clearWarns,
  // reminders
  addReminder, getPendingReminders, markReminderDone, getUserReminders,
  // memory
  getMemory, setMemory, clearMemory,
  // analytics
  logCommand: logCommandRich, logMessage, logGroupMessage,
  getGroupAnalytics, getUserAnalytics,
  getAnalytics, getGroupStats,
  // autokick
  getAutokickSettings, setAutokickSettings,
  // anti-flood
  getFloodSettings, setFloodSettings, trackFlood,
  // polls
  savePoll, getPoll, deletePoll,
};
