/**
 * ⚡ NovaSpark Bot v5 — AntiCall
 * Auto-reject incoming calls to the bot number
 * Inspired by Knightbot-MD | By Dev-Ntando
 *
 * NOTE: The call rejection hook must be wired in index.js:
 *   sock.ev.on('call', async (calls) => {
 *     if (anticallState.enabled) {
 *       for (const c of calls) {
 *         if (c.status === 'offer') await sock.rejectCall(c.id, c.from);
 *       }
 *     }
 *   });
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/anticall.json');

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

// Export state for index.js to read
const anticallState = readState();
module.exports.anticallState = anticallState;

module.exports = {
  name: 'anticall',
  aliases: ['blockcall', 'callblock'],
  category: 'owner',
  description: 'Auto-reject incoming calls to the bot',
  usage: '.anticall on | off | status',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const sub = (args[0] || '').toLowerCase();

    if (!sub || sub === 'status') {
      const state = readState();
      return extra.reply(
        `📵 *AntiCall*\n\n` +
        `Status: *${state.enabled ? '🟢 ON' : '🔴 OFF'}*\n\n` +
        `_When ON, all incoming calls are auto-rejected._`
      );
    }

    if (sub === 'on') {
      writeState(true);
      anticallState.enabled = true;
      return extra.reply('📵 *AntiCall enabled.* Incoming calls will be auto-rejected.');
    }

    if (sub === 'off') {
      writeState(false);
      anticallState.enabled = false;
      return extra.reply('📵 *AntiCall disabled.*');
    }

    return extra.reply('❓ Usage: `.anticall on | off | status`');
  },
};
