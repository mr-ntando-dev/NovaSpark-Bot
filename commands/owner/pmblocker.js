/**
 * ⚡ NovaSpark Bot v5 — PM Blocker
 * Block direct messages to the bot — owner only
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/pmblocker.json');
const DEFAULT_MSG = '⚠️ This bot does not accept direct messages.\nPlease use me in a group chat!';

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { enabled: false, message: DEFAULT_MSG };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return { enabled: false, message: DEFAULT_MSG }; }
}

function writeState(state) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

const pmState = readState();
module.exports.pmState = pmState;

module.exports = {
  name: 'pmblocker',
  aliases: ['blockpm', 'dmblocker'],
  category: 'owner',
  description: 'Block direct messages to the bot',
  usage: '.pmblocker on | off | status | setmsg <text>',
  ownerOnly: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const sub  = (args[0] || '').toLowerCase();
    const rest = args.slice(1).join(' ');

    if (!sub || sub === 'status') {
      const s = readState();
      return reply(
        `💬 *PM Blocker*\n\n` +
        `Status : *${s.enabled ? '🟢 ON' : '🔴 OFF'}*\n` +
        `Message: _${s.message}_`
      );
    }

    if (sub === 'on') {
      const s = readState();
      s.enabled = true;
      writeState(s);
      pmState.enabled = true;
      return reply('💬 *PM Blocker enabled.* DMs will receive the block message.');
    }

    if (sub === 'off') {
      const s = readState();
      s.enabled = false;
      writeState(s);
      pmState.enabled = false;
      return reply('💬 *PM Blocker disabled.*');
    }

    if (sub === 'setmsg') {
      if (!rest) return reply('❌ Provide a message: `.pmblocker setmsg <your text>`');
      const s = readState();
      s.message = rest;
      writeState(s);
      pmState.message = rest;
      return reply(`✅ PM block message updated to:\n\n_${rest}_`);
    }

    return reply('❓ Usage: `.pmblocker on | off | status | setmsg <text>`');
  },
};
