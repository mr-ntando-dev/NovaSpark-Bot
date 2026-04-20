/**
 * NovaSpark Bot — JSON Database
 * Handles group settings, user profiles, premium, reminders, analytics.
 * By Dev-Ntando
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const config = require('./config');

const DB_PATH      = path.join(__dirname, 'database');
const GROUPS_DB    = path.join(DB_PATH, 'groups.json');
const USERS_DB     = path.join(DB_PATH, 'users.json');
const MODS_DB      = path.join(DB_PATH, 'mods.json');
const PREMIUM_DB   = path.join(DB_PATH, 'premium.json');
const REMIND_DB    = path.join(DB_PATH, 'reminders.json');
const ANALYTICS_DB = path.join(DB_PATH, 'analytics.json');
const PROFILE_DB   = path.join(DB_PATH, 'profiles.json');
const SETTINGS_DB  = path.join(DB_PATH, 'settings.json');
const MEMORY_DB    = path.join(DB_PATH, 'memory.json');

if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

const initDB = (filePath, defaultData = {}) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
};

initDB(GROUPS_DB,    {});
initDB(USERS_DB,     {});
initDB(MODS_DB,      { moderators: [] });
initDB(PREMIUM_DB,   { users: [] });
initDB(REMIND_DB,    []);
initDB(ANALYTICS_DB, {});
initDB(PROFILE_DB,   {});
initDB(SETTINGS_DB,  {});
initDB(MEMORY_DB,    {});

const readDB = (filePath) => {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
  catch { return filePath === REMIND_DB ? [] : {}; }
};

const writeDB = (filePath, data) => {
  const tmp = filePath + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, filePath);
    return true;
  } catch (err) {
    console.error('DB write error: ' + err.message);
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {}
    return false;
  }
};

// Group settings
const getGroupSettings = (groupId) => {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) { groups[groupId] = { ...(config.defaultGroupSettings || {}) }; writeDB(GROUPS_DB, groups); }
  return groups[groupId];
};
const updateGroupSettings = (groupId, settings) => {
  const groups = readDB(GROUPS_DB);
  groups[groupId] = { ...groups[groupId], ...settings };
  return writeDB(GROUPS_DB, groups);
};

// Users
const getUser = (userId) => {
  const users = readDB(USERS_DB);
  const num = userId.includes('@') ? userId.split('@')[0] : userId;
  if (!users[num]) { users[num] = { registered: Date.now(), warnings: 0 }; writeDB(USERS_DB, users); }
  return users[num];
};
const updateUser = (userId, data) => {
  const users = readDB(USERS_DB);
  const num = userId.includes('@') ? userId.split('@')[0] : userId;
  users[num] = { ...users[num], ...data };
  return writeDB(USERS_DB, users);
};

// Profiles (registration)
const getProfile = (userId) => {
  const num = userId.includes('@') ? userId.split('@')[0] : userId;
  return readDB(PROFILE_DB)[num] || null;
};
const saveProfile = (userId, profile) => {
  const num = userId.includes('@') ? userId.split('@')[0] : userId;
  const profiles = readDB(PROFILE_DB);
  profiles[num] = { ...(profiles[num] || {}), ...profile, updatedAt: Date.now() };
  if (!profiles[num].createdAt) profiles[num].createdAt = Date.now();
  return writeDB(PROFILE_DB, profiles);
};
const hasProfile = (userId) => !!getProfile(userId);

// Premium
const _norm = (id) => (id.includes('@') ? id.split('@')[0] : id);
const isPremium = (userId) => {
  const db = readDB(PREMIUM_DB);
  return Array.isArray(db.users) && db.users.includes(_norm(userId));
};
const setPremium = (userId) => {
  const db = readDB(PREMIUM_DB);
  if (!Array.isArray(db.users)) db.users = [];
  if (!db.users.includes(_norm(userId))) db.users.push(_norm(userId));
  return writeDB(PREMIUM_DB, db);
};
const removePremium = (userId) => {
  const db = readDB(PREMIUM_DB);
  if (!Array.isArray(db.users)) return true;
  db.users = db.users.filter(u => u !== _norm(userId));
  return writeDB(PREMIUM_DB, db);
};
const listPremium = () => { const db = readDB(PREMIUM_DB); return Array.isArray(db.users) ? db.users : []; };

// Analytics
const logCommand = (userId, command) => {
  const db = readDB(ANALYTICS_DB);
  const num = _norm(userId);
  if (!db[num]) db[num] = { total: 0, commands: {}, firstSeen: Date.now(), lastSeen: Date.now() };
  db[num].total++;
  db[num].lastSeen = Date.now();
  db[num].commands[command] = (db[num].commands[command] || 0) + 1;
  writeDB(ANALYTICS_DB, db);
};
const getAnalytics = (userId) => {
  const db = readDB(ANALYTICS_DB);
  return db[_norm(userId)] || { total: 0, commands: {}, firstSeen: null, lastSeen: null };
};

// Reminders
const addReminder = (userId, chatId, message, triggerAt) => {
  const reminders = readDB(REMIND_DB);
  reminders.push({ id: Date.now().toString(), userId: _norm(userId), chatId, message, triggerAt, done: false });
  return writeDB(REMIND_DB, reminders);
};
const getPendingReminders = () => { const now = Date.now(); return readDB(REMIND_DB).filter(r => !r.done && r.triggerAt <= now); };
const markReminderDone = (id) => {
  const reminders = readDB(REMIND_DB);
  const idx = reminders.findIndex(r => r.id === id);
  if (idx !== -1) { reminders[idx].done = true; writeDB(REMIND_DB, reminders); }
};
const getUserReminders = (userId) => readDB(REMIND_DB).filter(r => r.userId === _norm(userId) && !r.done);

// Mods
const isModerator = (number) => { const mods = readDB(MODS_DB); return Array.isArray(mods.moderators) && mods.moderators.includes(number); };

// ── Settings (key/value store for global bot settings like antidelete) ────────
const getSetting = (key) => {
  const db = readDB(SETTINGS_DB);
  return db[key] !== undefined ? db[key] : null;
};
const setSetting = (key, value) => {
  const db  = readDB(SETTINGS_DB);
  db[key]   = value;
  return writeDB(SETTINGS_DB, db);
};

// ── Persistent Conversation Memory (survives restarts) ────────────────────────
// Stores last N messages per user for cross-restart AI context
const MEMORY_LIMIT = 20; // messages per user

const getMemory = (userId) => {
  const db  = readDB(MEMORY_DB);
  const num = _norm(userId);
  return Array.isArray(db[num]) ? db[num] : [];
};

const appendMemory = (userId, role, content) => {
  const db  = readDB(MEMORY_DB);
  const num = _norm(userId);
  if (!Array.isArray(db[num])) db[num] = [];
  db[num].push({ role, content, ts: Date.now() });
  // Keep only last MEMORY_LIMIT entries
  if (db[num].length > MEMORY_LIMIT) db[num] = db[num].slice(-MEMORY_LIMIT);
  return writeDB(MEMORY_DB, db);
};

const clearMemory = (userId) => {
  const db  = readDB(MEMORY_DB);
  const num = _norm(userId);
  delete db[num];
  return writeDB(MEMORY_DB, db);
};

module.exports = {
  getGroupSettings, updateGroupSettings,
  getUser, updateUser,
  getProfile, saveProfile, hasProfile,
  isPremium, setPremium, removePremium, listPremium,
  logCommand, getAnalytics,
  addReminder, getPendingReminders, markReminderDone, getUserReminders,
  isModerator,
  getSetting, setSetting,
  getMemory, appendMemory, clearMemory,
};
