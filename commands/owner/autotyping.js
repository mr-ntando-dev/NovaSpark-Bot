/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * .autotyping on/off — Simulate typing indicator on every incoming message
 * Owner only
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/autotyping.json');

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
module.exports.autotypingState = state;

module.exports = {
  name: 'autotyping',
  aliases: ['autotyoing', 'typing'],
  category: 'owner',
  description: 'Auto-show typing indicator on every message',
  usage: '.autotyping on | off | status',
  ownerOnly: true,

  async execute({ args, reply }) {
    const sub = (args[0] || '').toLowerCase();
    if (!sub || sub === 'status') {
      return reply(`⌨️ *Auto Typing*\n\nStatus: *${state.enabled ? '🟢 ON' : '🔴 OFF'}*`);
    }
    if (sub === 'on') {
      writeState(true);
      state.enabled = true;
      return reply('⌨️ *Auto Typing ON* — bot will appear to type on every message.');
    }
    if (sub === 'off') {
      writeState(false);
      state.enabled = false;
      return reply('⌨️ *Auto Typing OFF*.');
    }
    return reply('❓ Usage: `.autotyping on | off | status`');
  },
};
