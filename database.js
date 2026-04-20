/**
 * NovaSpark Bot — JSON Database
 * Handles group settings and user data needed by AutoChat.
 * By Dev-Ntando
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const config = require('./config');

const DB_PATH   = path.join(__dirname, 'database');
const GROUPS_DB = path.join(DB_PATH, 'groups.json');
const USERS_DB  = path.join(DB_PATH, 'users.json');
const MODS_DB   = path.join(DB_PATH, 'mods.json');

// Ensure database directory exists
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

const initDB = (filePath, defaultData = {}) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initDB(GROUPS_DB, {});
initDB(USERS_DB,  {});
initDB(MODS_DB,   { moderators: [] });

// ── Low-level helpers ─────────────────────────────────────────────────────────
const readDB = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
};

const writeDB = (filePath, data) => {
  const tmp = filePath + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, filePath);
    return true;
  } catch (err) {
    console.error(`DB write error: ${err.message}`);
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {}
    return false;
  }
};

// ── Group settings ────────────────────────────────────────────────────────────
const getGroupSettings = (groupId) => {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) {
    groups[groupId] = { ...(config.defaultGroupSettings || {}) };
    writeDB(GROUPS_DB, groups);
  }
  return groups[groupId];
};

const updateGroupSettings = (groupId, settings) => {
  const groups = readDB(GROUPS_DB);
  groups[groupId] = { ...groups[groupId], ...settings };
  return writeDB(GROUPS_DB, groups);
};

// ── User data ─────────────────────────────────────────────────────────────────
const getUser = (userId) => {
  const users = readDB(USERS_DB);
  if (!users[userId]) {
    users[userId] = {
      registered: Date.now(),
      premium: false,
      warnings: 0,
    };
    writeDB(USERS_DB, users);
  }
  return users[userId];
};

const updateUser = (userId, data) => {
  const users = readDB(USERS_DB);
  users[userId] = { ...users[userId], ...data };
  return writeDB(USERS_DB, users);
};

// ── Moderators ────────────────────────────────────────────────────────────────
const isModerator = (number) => {
  const mods = readDB(MODS_DB);
  return Array.isArray(mods.moderators) && mods.moderators.includes(number);
};

module.exports = {
  getGroupSettings,
  updateGroupSettings,
  getUser,
  updateUser,
  isModerator,
};
