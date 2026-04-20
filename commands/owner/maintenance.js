/**
 * ⚡ NovaSpark Bot v5 — Maintenance Mode & Owner Mode
 * .maintenance on/off [message] — disable all commands for non-owners with custom notice
 * .ownermode on/off             — owner-only lockdown (only owner can run any cmd)
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../../data/maintenance.json');

function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return { maintenance: false, ownerMode: false, message: '' };
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { maintenance: false, ownerMode: false, message: '' };
  }
}

function writeState(s) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

// Exported checker — called in handler.js before command execution
const getModeState = () => readState();

module.exports = [
  { _maintenanceExport: true, getModeState },

  // ── .maintenance ──────────────────────────────────────────────────────────
  {
    name: 'maintenance',
    aliases: ['maintain', 'botmaintenance'],
    description: '🔧 Toggle maintenance mode (blocks all non-owner commands)',
    category: 'owner',
    ownerOnly: true,

    async execute({ args, reply }) {
      const sub     = (args[0] || '').toLowerCase();
      const state   = readState();
      const message = args.slice(1).join(' ').trim();

      if (!sub || (sub !== 'on' && sub !== 'off')) {
        const status = state.maintenance ? '🔧 ON' : '✅ OFF';
        return reply(
          `🔧 *Maintenance Mode* — currently ${status}\n` +
          '━'.repeat(30) + '\n\n' +
          'Usage:\n' +
          '  `.maintenance on [custom message]`\n' +
          '  `.maintenance off`\n\n' +
          `Current message: _${state.message || 'default'}_`
        );
      }

      if (sub === 'on') {
        state.maintenance = true;
        state.message     = message || '🔧 NovaSpark Bot is under maintenance. Back soon!';
        writeState(state);
        return reply(
          `🔧 *Maintenance mode ENABLED*\n\n` +
          `📢 Message: _${state.message}_\n\n` +
          '_Only owner commands will work until maintenance is off._'
        );
      }

      state.maintenance = false;
      state.message     = '';
      writeState(state);
      return reply('✅ *Maintenance mode DISABLED.* Bot is fully operational again.');
    },
  },

  // ── .ownermode ────────────────────────────────────────────────────────────
  {
    name: 'ownermode',
    aliases: ['lockdown', 'owneronly'],
    description: '🔒 Lock the bot — only owner can use any command',
    category: 'owner',
    ownerOnly: true,

    async execute({ args, reply }) {
      const sub   = (args[0] || '').toLowerCase();
      const state = readState();

      if (!sub || (sub !== 'on' && sub !== 'off')) {
        const status = state.ownerMode ? '🔒 ON' : '🔓 OFF';
        return reply(
          `🔒 *Owner Mode* — currently ${status}\n\n` +
          'Usage:\n' +
          '  `.ownermode on`  — only owner can use ANY command\n' +
          '  `.ownermode off` — restore normal access'
        );
      }

      if (sub === 'on') {
        state.ownerMode = true;
        writeState(state);
        return reply(
          '🔒 *Owner Mode ENABLED*\n\n' +
          '_All commands are now restricted to the bot owner only._\n' +
          'Use `.ownermode off` to restore access.'
        );
      }

      state.ownerMode = false;
      writeState(state);
      return reply('🔓 *Owner Mode DISABLED.* All users can use the bot normally.');
    },
  },
];

module.exports.getModeState = getModeState;
