'use strict';
/**
 * NovaSpark Multi-Hosting — Simple JSON Database
 * Stores user accounts and their bot instances
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function _load() {
  try {
    if (!fs.existsSync(DB_FILE)) return { users: {}, bots: {} };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch { return { users: {}, bots: {} }; }
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
  db.users[id] = { id, email, passwordHash: hash, createdAt: Date.now(), plan: 'free' };
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

function verifyUser(email, password) {
  const user = getUser(email);
  if (!user) return null;
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
  // 7 day expiry
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
  };
}

module.exports = {
  createUser, getUser, getUserById, verifyUser,
  createSession, getSession, deleteSession,
  createBot, getBot, getUserBots, updateBot, deleteBot, getAllBots,
  getStats,
};
