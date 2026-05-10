'use strict';
/**
 * NovaSpark Multi-Hosting — Bot Process Manager
 * Spawns, monitors and manages individual bot worker processes
 */

const { spawn }  = require('child_process');
const path       = require('path');
const fs         = require('fs');
const db         = require('./db');

const ROOT       = path.join(__dirname, '..');
const WORKER     = path.join(__dirname, 'bot-worker.js');
const SESSIONS   = path.join(__dirname, 'sessions');

// Map of botId -> { process, pairResolver }
const _procs = new Map();

if (!fs.existsSync(SESSIONS)) fs.mkdirSync(SESSIONS, { recursive: true });

// ── Start a bot ─────────────────────────────────────────────────────────────
function startBot(botId) {
  if (_procs.has(botId)) return { error: 'Already running' };

  const bot = db.getBot(botId);
  if (!bot) return { error: 'Bot not found' };

  const sessionDir = path.join(SESSIONS, botId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  db.updateBot(botId, { status: 'pairing', error: null, pairCode: null });

  const env = {
    ...process.env,
    BOT_ID:       botId,
    BOT_NAME:     bot.botName,
    OWNER_NUMBER: bot.ownerNumber,
    PREFIX:       bot.prefix,
    SESSION_ID:   bot.sessionID || '',
    SESSION_DIR:  sessionDir,
    ROOT_DIR:     ROOT,
  };

  const child = spawn('node', [WORKER], {
    env,
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  _procs.set(botId, { process: child });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      _handleWorkerLine(botId, line);
    }
  });

  child.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error(`[BOT:${botId}] ERR: ${msg}`);
  });

  child.on('exit', (code) => {
    _procs.delete(botId);
    const bot = db.getBot(botId);
    if (bot && bot.status !== 'stopped') {
      db.updateBot(botId, { status: 'stopped', error: code ? `Exited with code ${code}` : null });
    }
    console.log(`[MANAGER] Bot ${botId} exited (code ${code})`);
  });

  return { ok: true };
}

// ── Stop a bot ──────────────────────────────────────────────────────────────
function stopBot(botId) {
  const proc = _procs.get(botId);
  if (!proc) return { error: 'Not running' };
  proc.process.kill('SIGTERM');
  _procs.delete(botId);
  db.updateBot(botId, { status: 'stopped', pairCode: null });
  return { ok: true };
}

// ── Restart a bot ────────────────────────────────────────────────────────────
function restartBot(botId) {
  stopBot(botId);
  setTimeout(() => startBot(botId), 1500);
  return { ok: true };
}

// ── Delete a bot (stop + remove session) ────────────────────────────────────
function deleteBot(botId) {
  stopBot(botId);
  const sessionDir = path.join(SESSIONS, botId);
  if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
  db.deleteBot(botId);
  return { ok: true };
}

// ── Handle output lines from worker ─────────────────────────────────────────
function _handleWorkerLine(botId, line) {
  try {
    // Workers emit JSON events on stdout
    if (line.startsWith('{')) {
      const evt = JSON.parse(line);
      switch (evt.type) {
        case 'pair_code':
          db.updateBot(botId, { status: 'pairing', pairCode: evt.code });
          console.log(`[BOT:${botId}] Pair code: ${evt.code}`);
          break;
        case 'online':
          db.updateBot(botId, { status: 'online', pairCode: null, lastSeen: Date.now(), error: null });
          console.log(`[BOT:${botId}] ✅ Online as ${evt.number}`);
          break;
        case 'session_id':
          db.updateBot(botId, { sessionID: evt.sessionID });
          console.log(`[BOT:${botId}] Session saved.`);
          break;
        case 'error':
          db.updateBot(botId, { status: 'error', error: evt.message });
          console.error(`[BOT:${botId}] Error: ${evt.message}`);
          break;
        case 'offline':
          db.updateBot(botId, { status: 'stopped' });
          break;
        case 'heartbeat':
          db.updateBot(botId, { lastSeen: Date.now() });
          break;
      }
    }
  } catch {}
}

// ── Get runtime status ───────────────────────────────────────────────────────
function isRunning(botId) {
  return _procs.has(botId);
}

function runningCount() {
  return _procs.size;
}

// ── Auto-restart bots that were online before a crash ───────────────────────
function autoRestoreOnlineBots() {
  const bots = db.getAllBots();
  let restored = 0;
  for (const bot of bots) {
    if (bot.status === 'online' && bot.sessionID) {
      console.log(`[MANAGER] Auto-restoring bot ${bot.id} (${bot.botName})`);
      startBot(bot.id);
      restored++;
    }
  }
  if (restored > 0) console.log(`[MANAGER] Restored ${restored} bot(s).`);
}

module.exports = { startBot, stopBot, restartBot, deleteBot, isRunning, runningCount, autoRestoreOnlineBots };
