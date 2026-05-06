/**
 * ⚡ NovaSpark Bot v5 — AutoRead
 * Automatically mark all messages as read
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/autoread.json');

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

const autoreadState = readState();
module.exports.autoreadState = autoreadState;

module.exports = {
  name: 'autoread',
  aliases: ['readall', 'ar'],
  category: 'owner',
  description: 'Auto-mark all messages as read (blue ticks)',
  usage: '.autoread on | off | status',
  ownerOnly: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const sub = (args[0] || '').toLowerCase();

    if (!sub || sub === 'status') {
      const s = readState();
      return reply(`👁️ *AutoRead*\n\nStatus: *${s.enabled ? '🟢 ON' : '🔴 OFF'}*`);
    }

    if (sub === 'on') {
      writeState(true);
      autoreadState.enabled = true;
      return reply('👁️ *AutoRead ON* — all messages will be marked as read.');
    }

    if (sub === 'off') {
      writeState(false);
      autoreadState.enabled = false;
      return reply('👁️ *AutoRead OFF*.');
    }

    return reply('❓ Usage: `.autoread on | off | status`');
  },
};
