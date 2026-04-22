/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * .autoonline on/off — Keep bot presence as "Online" at all times
 * Owner only
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/autoonline.json');
let _interval   = null;

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
module.exports.autoonlineState = state;

// Called from handler.js to start/stop the presence loop
module.exports.startOnlineLoop = function startOnlineLoop(sock) {
  if (_interval) return;
  _interval = setInterval(async () => {
    const s = readState();
    if (!s.enabled) return;
    try { await sock.sendPresenceUpdate('available'); } catch {}
  }, 30000);
};

module.exports = {
  name: 'autoonline',
  aliases: ['keeponline', 'onlinemode'],
  category: 'owner',
  description: 'Keep bot presence as Online continuously',
  usage: '.autoonline on | off | status',
  ownerOnly: true,

  async execute({ sock, args, reply }) {
    const sub = (args[0] || '').toLowerCase();
    if (!sub || sub === 'status') {
      return reply(`🟢 *Auto Online*\n\nStatus: *${state.enabled ? '🟢 ON' : '🔴 OFF'}*`);
    }
    if (sub === 'on') {
      writeState(true);
      state.enabled = true;
      module.exports.startOnlineLoop(sock);
      return reply('🟢 *Auto Online ON* — bot will stay online continuously.');
    }
    if (sub === 'off') {
      writeState(false);
      state.enabled = false;
      if (_interval) { clearInterval(_interval); _interval = null; }
      try { await sock.sendPresenceUpdate('unavailable'); } catch {}
      return reply('🔴 *Auto Online OFF*.');
    }
    return reply('❓ Usage: `.autoonline on | off | status`');
  },
};
