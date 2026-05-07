/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * .autopm on/off/set — Auto-reply to private messages when owner is away
 * Owner only
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/autopm.json');
const DEFAULT_MSG = '👋 Hey! I\'m currently unavailable. NovaSpark Bot will assist you. Type *.menu* for commands.';

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { enabled: false, message: DEFAULT_MSG };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return { enabled: false, message: DEFAULT_MSG }; }
}
function writeState(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

const state = readState();
module.exports.autopmState = state;

// Called by handler for non-command private messages
module.exports.checkAutoPM = async function checkAutoPM(sock, msg, from, body) {
  const s = readState();
  if (!s.enabled) return false;
  if (!from || from.endsWith('@g.us')) return false; // groups only in DMs
  try {
    await sock.sendMessage(from, { text: s.message }, { quoted: msg });
  } catch {}
  return true;
};

module.exports = {
  name: 'autopm',
  aliases: ['awaymode', 'autopmreply'],
  category: 'owner',
  description: 'Auto-reply to private messages when away',
  usage: '.autopm on | off | status | set <message>',
  ownerOnly: true,

  async execute({ args, reply }) {
    const sub = (args[0] || '').toLowerCase();
    const s   = readState();

    if (!sub || sub === 'status') {
      return reply(
        `📩 *Auto PM Reply*\n\n` +
        `Status: *${s.enabled ? '🟢 ON' : '🔴 OFF'}*\n\n` +
        `*Message:*\n_${s.message}_`
      );
    }
    if (sub === 'on') {
      writeState({ ...s, enabled: true });
      state.enabled = true;
      return reply('📩 *Auto PM Reply ON* — replying to all DMs automatically.');
    }
    if (sub === 'off') {
      writeState({ ...s, enabled: false });
      state.enabled = false;
      return reply('📩 *Auto PM Reply OFF*.');
    }
    if (sub === 'set') {
      const newMsg = args.slice(1).join(' ');
      if (!newMsg) return reply('❓ Usage: `.autopm set <your message>`');
      writeState({ ...s, message: newMsg });
      state.message = newMsg;
      return reply(`📩 *Auto PM message updated!*\n\n_"${newMsg}"_`);
    }
    return reply('❓ Usage: `.autopm on | off | status | set <message>`');
  },
};
