'use strict';
/**
 * NovaSpark Multi-Hosting — Simple JSON Database
 * Stores user accounts, bot instances, and server registry
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function _load() {
  try {
    if (!fs.existsSync(DB_FILE)) return { users: {}, bots: {}, sessions: {}, servers: {} };
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!data.servers) data.servers = {};
    return data;
  } catch { return { users: {}, bots: {}, sessions: {}, servers: {} }; }
}

function _save(data) {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── Users ──────────────────────────────────────────────────────────────────

function createUser(email, password) {
  const db = _load();
  if (Object.values(db.users).find(u => u.email === email)) return null;
  const id = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  db.users[id] = { id, email, passwordHash: hash, createdAt: Date.now(), plan: 'free', banned: false, botLimit: 3 };
  _save(db);
  return db.users[id];
}

function getUser(email) {
  const db = _load();
  return Object.values(db.users).find(u => u.email === email) || null;
}

function getUserById(id) {
  const db = _load();
  return db.users[id] || null;
}

function getAllUsers() {
  const db = _load();
  return Object.values(db.users);
}

function updateUser(id, fields) {
  const db = _load();
  if (!db.users[id]) return null;
  Object.assign(db.users[id], fields);
  _save(db);
  return db.users[id];
}

function deleteUser(id) {
  const db = _load();
  // Also delete their bots
  for (const botId of Object.keys(db.bots)) {
    if (db.bots[botId].userId === id) delete db.bots[botId];
  }
  delete db.users[id];
  _save(db);
}

function verifyUser(email, password) {
  const user = getUser(email);
  if (!user) return null;
  if (user.banned) return { banned: true };
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return hash === user.passwordHash ? user : null;
}

function createSession(userId) {
  const db = _load();
  const token = crypto.randomBytes(32).toString('hex');
  if (!db.sessions) db.sessions = {};
  db.sessions[token] = { userId, createdAt: Date.now() };
  _save(db);
  return token;
}

function getSession(token) {
  const db = _load();
  if (!db.sessions) return null;
  const s = db.sessions[token];
  if (!s) return null;
  if (Date.now() - s.createdAt > 7 * 24 * 60 * 60 * 1000) {
    delete db.sessions[token];
    _save(db);
    return null;
  }
  return getUserById(s.userId);
}

function deleteSession(token) {
  const db = _load();
  if (db.sessions) delete db.sessions[token];
  _save(db);
}

// ── Bots ───────────────────────────────────────────────────────────────────

function createBot(userId, { botName, ownerNumber, prefix }) {
  const db = _load();

  const id = crypto.randomBytes(8).toString('hex');
  db.bots[id] = {
    id,
    userId,
    botName:     botName     || 'NovaSpark Bot',
    ownerNumber: ownerNumber || '',
    prefix:      prefix      || '.',
    sessionID:   '',
    status:      'stopped',  // stopped | pairing | online | error
    createdAt:   Date.now(),
    lastSeen:    null,
    pairCode:    null,
    error:       null,
  };
  _save(db);
  return db.bots[id];
}

function getBot(id) {
  const db = _load();
  return db.bots[id] || null;
}

function getUserBots(userId) {
  const db = _load();
  return Object.values(db.bots).filter(b => b.userId === userId);
}

function updateBot(id, fields) {
  const db = _load();
  if (!db.bots[id]) return null;
  Object.assign(db.bots[id], fields);
  _save(db);
  return db.bots[id];
}

function deleteBot(id) {
  const db = _load();
  delete db.bots[id];
  _save(db);
}

function getAllBots() {
  const db = _load();
  return Object.values(db.bots);
}

function getStats() {
  const db = _load();
  const bots = Object.values(db.bots);
  return {
    totalUsers: Object.keys(db.users).length,
    totalBots:  bots.length,
    onlineBots: bots.filter(b => b.status === 'online').length,
    stoppedBots: bots.filter(b => b.status === 'stopped').length,
    pairingBots: bots.filter(b => b.status === 'pairing').length,
    totalServers: Object.keys(db.servers || {}).length,
  };
}

// ── Server Registry ────────────────────────────────────────────────────────

function addServer({ name, url, maxBots, serverId, notes }) {
  const db = _load();
  const id = serverId || crypto.randomBytes(6).toString('hex');
  db.servers[id] = {
    id,
    name:    name    || `Server ${id}`,
    url:     url     || '',
    maxBots: parseInt(maxBots || 10, 10),
    notes:   notes   || '',
    active:  true,
    addedAt: Date.now(),
  };
  _save(db);
  return db.servers[id];
}

function getServer(id) {
  const db = _load();
  return (db.servers || {})[id] || null;
}

function getAllServers() {
  const db = _load();
  return Object.values(db.servers || {});
}

function updateServer(id, fields) {
  const db = _load();
  if (!db.servers || !db.servers[id]) return null;
  Object.assign(db.servers[id], fields);
  _save(db);
  return db.servers[id];
}

function deleteServer(id) {
  const db = _load();
  if (db.servers) delete db.servers[id];
  _save(db);
}

module.exports = {
  createUser, getUser, getUserById, getAllUsers, updateUser, deleteUser, verifyUser,
  createSession, getSession, deleteSession,
  createBot, getBot, getUserBots, updateBot, deleteBot, getAllBots,
  getStats,
  addServer, getServer, getAllServers, updateServer, deleteServer,
};
