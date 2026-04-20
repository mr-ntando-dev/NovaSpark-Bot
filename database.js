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

module.exports = {
  getGroupSettings, updateGroupSettings, getAllGroupSettings,
  getUserProfile, updateUserProfile,
  isPremium, addPremium, removePremium, listPremium,
  getSetting, setSetting,
  getWarns, addWarn, clearWarns,
  addReminder, getPendingReminders, markReminderDone,
  getMemory, setMemory, clearMemory,
  logCommand, logMessage, logGroupMessage,
  getGroupAnalytics, getUserAnalytics,
};
