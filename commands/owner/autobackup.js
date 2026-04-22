/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * .autobackup on/off/now — Auto-DM the owner a database backup every 24h
 * Owner only
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE    = path.resolve(__dirname, '../../data/autobackup.json');
const DATABASE_DIR = path.resolve(__dirname, '../../data');
let _interval      = null;

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { enabled: false };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return { enabled: false }; }
}
function writeState(enabled) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ enabled }, null, 2));
}

const state = readState();
module.exports.autobackupState = state;

async function sendBackup(sock, ownerJid) {
  try {
    const dbPath = path.join(DATABASE_DIR, 'database.json');
    if (!fs.existsSync(dbPath)) {
      await sock.sendMessage(ownerJid, { text: '📦 *Auto Backup* — No database.json found yet.' });
      return;
    }
    const content = fs.readFileSync(dbPath);
    const date    = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    await sock.sendMessage(ownerJid, {
      document: content,
      mimetype: 'application/json',
      fileName: `novaspark-backup-${date}.json`,
      caption : `📦 *Auto Backup — NovaSpark Bot*\n🕐 ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Harare' })}`,
    });
  } catch (e) {
    try { await sock.sendMessage(ownerJid, { text: `📦 *Auto Backup failed:* ${e.message}` }); } catch {}
  }
}

module.exports.startBackupLoop = function startBackupLoop(sock, ownerJid) {
  if (_interval) return;
  _interval = setInterval(async () => {
    const s = readState();
    if (!s.enabled) return;
    await sendBackup(sock, ownerJid);
  }, 24 * 60 * 60 * 1000); // every 24 hours
};

module.exports = {
  name: 'autobackup',
  aliases: ['backup', 'dbbackup'],
  category: 'owner',
  description: 'Auto-DM owner a database backup every 24h',
  usage: '.autobackup on | off | now | status',
  ownerOnly: true,

  async execute({ sock, args, reply, sender }) {
    const sub = (args[0] || '').toLowerCase();
    const config = require('../../config');
    const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
    const ownerJid = `${ownerNum}@s.whatsapp.net`;

    if (!sub || sub === 'status') {
      return reply(`📦 *Auto Backup*\n\nStatus: *${state.enabled ? '🟢 ON' : '🔴 OFF'}*\n_Backup is sent to your DM every 24 hours._`);
    }
    if (sub === 'on') {
      writeState(true);
      state.enabled = true;
      module.exports.startBackupLoop(sock, ownerJid);
      return reply('📦 *Auto Backup ON* — database will be sent to your DM every 24 hours.');
    }
    if (sub === 'off') {
      writeState(false);
      state.enabled = false;
      if (_interval) { clearInterval(_interval); _interval = null; }
      return reply('📦 *Auto Backup OFF*.');
    }
    if (sub === 'now') {
      await reply('📦 Sending backup now...');
      await sendBackup(sock, ownerJid);
      return;
    }
    return reply('❓ Usage: `.autobackup on | off | now | status`');
  },
};
