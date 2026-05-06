/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * .autoleave on/off — Auto-leave groups the bot is added to without owner permission
 * Owner only
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/autoleave.json');

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
module.exports.autoleaveState = state;

// Called from index.js group-participants-update event
module.exports.checkAutoLeave = async function checkAutoLeave(sock, update) {
  const s = readState();
  if (!s.enabled) return;
  const { id, action } = update;
  if (action !== 'add') return; // only on being added
  const me = sock.user?.id ? sock.user.id.split(':')[0].split('@')[0] : '';
  const added = (update.participants || []).map(p => p.split('@')[0].split(':')[0]);
  if (!added.includes(me)) return;
  try {
    await sock.sendMessage(id, { text: '⚠️ *Auto-Leave:* I am not authorized to join groups without owner approval. Leaving now...' });
    await sock.groupLeave(id);
  } catch {}
};

module.exports = {
  name: 'autoleave',
  aliases: ['autoabandono', 'aleave'],
  category: 'owner',
  description: 'Auto-leave groups added without owner permission',
  usage: '.autoleave on | off | status',
  ownerOnly: true,

  async execute({ args, reply }) {
    const sub = (args[0] || '').toLowerCase();
    if (!sub || sub === 'status') {
      return reply(`🚪 *Auto Leave*\n\nStatus: *${state.enabled ? '🟢 ON' : '🔴 OFF'}*\n_Bot will auto-leave any group it is added to when ON._`);
    }
    if (sub === 'on') {
      writeState(true);
      state.enabled = true;
      return reply('🚪 *Auto Leave ON* — bot will leave any group it is added to without permission.');
    }
    if (sub === 'off') {
      writeState(false);
      state.enabled = false;
      return reply('🚪 *Auto Leave OFF* — bot will stay in groups it is added to.');
    }
    return reply('❓ Usage: `.autoleave on | off | status`');
  },
};
