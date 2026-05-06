/**
 * ⚡ NovaSpark Bot — Auto Status Poster
 * .autostatus on <interval_hours> <message>
 * .autostatus off
 * .autostatus now <message>    — post immediately
 * Posts a WhatsApp Status update on a schedule.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const config   = require('../../config');

// In-memory schedule
let _timer = null;

async function postStatus(sock, text) {
  try {
    await sock.sendMessage('status@broadcast', {
      text: text || `⚡ ${config.botName} is ONLINE!\n\n_NovaSpark Bot v${config.botVersion}_\n_${new Date().toLocaleString()}_`,
    });
    return true;
  } catch (e) {
    return false;
  }
}

function startSchedule(sock, intervalMs, text) {
  if (_timer) clearInterval(_timer);
  _timer = setInterval(() => postStatus(sock, text), intervalMs);
}

function stopSchedule() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

module.exports = {
  name: 'autostatus',
  aliases: ['statuspost', 'setstatus'],
  ownerOnly: true,
  category: 'owner',
  description: 'Auto-post WhatsApp Status on a schedule',
  usage: '.autostatus on <hours> <text> | off | now <text>',

  startSchedule,
  stopSchedule,

  async execute({ sock, args, reply }) {
    const sub  = (args[0] || '').toLowerCase();
    const rest = args.slice(1).join(' ');

    if (sub === 'now') {
      const text = rest || `⚡ ${config.botName} is ONLINE! | ${new Date().toLocaleString()}`;
      const ok   = await postStatus(sock, text);
      return reply(ok ? '✅ Status posted!' : '❌ Could not post status. Make sure the bot is not using a linked device.');
    }

    if (sub === 'on') {
      const hours = Math.max(1, parseFloat(args[1]) || 6);
      const text  = args.slice(2).join(' ') ||
        `⚡ *${config.botName}* is running!\n_v${config.botVersion} | ${new Date().toLocaleDateString()}_`;
      startSchedule(sock, hours * 3600000, text);
      database.setSetting('autoStatus', { enabled: true, hours, text });
      return reply(`✅ *Auto-Status ON* — posting every *${hours}h*\n\nPreview:\n${text}`);
    }

    if (sub === 'off') {
      stopSchedule();
      database.setSetting('autoStatus', { enabled: false });
      return reply('🔴 Auto-Status DISABLED');
    }

    const s = database.getSetting('autoStatus') || {};
    return reply(
      `📡 *Auto-Status Info*\n\n` +
      `Status  : ${s.enabled ? '🟢 On' : '🔴 Off'}\n` +
      `Interval: ${s.hours ? s.hours + 'h' : 'N/A'}\n\n` +
      `_.autostatus on <hours> <text>_\n` +
      `_.autostatus now <text>_\n` +
      `_.autostatus off_`
    );
  },
};
