/**
 * ⚡ NovaSpark Bot — Event Countdown
 * .countdown set "Xmas" 2026-12-25
 * .countdown list
 * .countdown delete Xmas
 * .countdown <EventName>  — check time remaining
 */
'use strict';

const database = require('../../database');

function timeLeft(target) {
  const now  = Date.now();
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  let parts = [];
  if (days)    parts.push(`${days}d`);
  if (hours)   parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds && !days) parts.push(`${seconds}s`);
  return parts.join(' ');
}

module.exports = {
  name:    'countdown',
  aliases: ['cd', 'timer', 'event'],
  category: 'tools',
  desc:    'Set and check event countdowns',
  usage:   '.countdown set "Name" YYYY-MM-DD\n.countdown list\n.countdown delete Name\n.countdown <Name>',
  example: '.countdown set "New Year" 2027-01-01\n.countdown list',
  async execute({ sock, msg, args, from }) {
    const gs = database.getGroupSettings(from) || {};
    if (!gs.countdowns) gs.countdowns = {};

    const sub = (args[0] || '').toLowerCase();

    // ── .countdown list ──────────────────────────────────────────────────────
    if (sub === 'list') {
      const entries = Object.entries(gs.countdowns);
      if (!entries.length) {
        return sock.sendMessage(from, { text: '📅 No countdowns set.\nUse `.countdown set "Name" YYYY-MM-DD` to add one.' }, { quoted: msg });
      }
      let txt = '📅 *Active Countdowns*\n\n';
      for (const [name, date] of entries) {
        const left = timeLeft(date);
        txt += left
          ? `• *${name}* — ${left} remaining (${date})\n`
          : `• *${name}* — ✅ Event has passed (${date})\n`;
      }
      return sock.sendMessage(from, { text: txt.trim() }, { quoted: msg });
    }

    // ── .countdown delete <name> ─────────────────────────────────────────────
    if (sub === 'delete' || sub === 'remove' || sub === 'del') {
      const name = args.slice(1).join(' ').replace(/"/g, '').trim();
      if (!name) return sock.sendMessage(from, { text: '❌ Provide the event name to delete.' }, { quoted: msg });
      const key = Object.keys(gs.countdowns).find(k => k.toLowerCase() === name.toLowerCase());
      if (!key) return sock.sendMessage(from, { text: `❌ Countdown *${name}* not found.` }, { quoted: msg });
      delete gs.countdowns[key];
      database.saveGroupSettings(from, gs);
      return sock.sendMessage(from, { text: `✅ Countdown *${key}* deleted.` }, { quoted: msg });
    }

    // ── .countdown set "name" YYYY-MM-DD ─────────────────────────────────────
    if (sub === 'set' || sub === 'add') {
      const rest    = args.slice(1).join(' ');
      const nameM   = rest.match(/["'](.+?)["']/);
      const dateM   = rest.match(/(\d{4}-\d{2}-\d{2})/);
      if (!nameM || !dateM) {
        return sock.sendMessage(from, {
          text: '❌ Usage: `.countdown set "Event Name" YYYY-MM-DD`\nExample: `.countdown set "Xmas" 2026-12-25`',
        }, { quoted: msg });
      }
      const name = nameM[1].trim();
      const date = dateM[1];
      if (isNaN(new Date(date).getTime())) {
        return sock.sendMessage(from, { text: '❌ Invalid date. Use YYYY-MM-DD format.' }, { quoted: msg });
      }
      gs.countdowns[name] = date;
      database.saveGroupSettings(from, gs);
      const left = timeLeft(date);
      return sock.sendMessage(from, {
        text: `✅ Countdown set!\n\n📅 *${name}*\n🗓️ Date: ${date}\n⏳ Time left: ${left || 'Event already passed'}`,
      }, { quoted: msg });
    }

    // ── .countdown <name> ────────────────────────────────────────────────────
    const name = args.join(' ').replace(/"/g, '').trim();
    if (name) {
      const key = Object.keys(gs.countdowns).find(k => k.toLowerCase() === name.toLowerCase());
      if (!key) {
        return sock.sendMessage(from, { text: `❌ No countdown named *${name}*.\nUse \`.countdown list\` to see all.` }, { quoted: msg });
      }
      const left = timeLeft(gs.countdowns[key]);
      return sock.sendMessage(from, {
        text: left
          ? `⏳ *${key}* — ${left} remaining (${gs.countdowns[key]})`
          : `✅ *${key}* — Event has already passed (${gs.countdowns[key]})`,
      }, { quoted: msg });
    }

    // ── Fallback: show usage ─────────────────────────────────────────────────
    await sock.sendMessage(from, {
      text: '📅 *Countdown Commands*\n\n' +
            '• `.countdown set "Xmas" 2026-12-25` — Add a countdown\n' +
            '• `.countdown list` — View all countdowns\n' +
            '• `.countdown Xmas` — Check specific event\n' +
            '• `.countdown delete Xmas` — Remove a countdown',
    }, { quoted: msg });
  },
};
