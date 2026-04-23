/**
 * ⚡ NovaSpark v9 — Event Countdown Timer
 * .countdown set "Event Name" 2026-12-25
 * .countdown show — See all countdowns
 * .countdown delete <n> — Remove (admin)
 * Per-group. Supports multiple events.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const CD_KEY = (gid) => `countdown_${gid}`;

function getCDs(gid) {
  return database.getSetting ? (database.getSetting(CD_KEY(gid)) || []) : [];
}
function saveCDs(gid, arr) {
  if (database.setSetting) database.setSetting(CD_KEY(gid), arr);
}

function formatCountdown(ms) {
  if (ms <= 0) return '⏰ Already passed!';
  const days = Math.floor(ms / 86400000);
  const hrs  = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const parts = [];
  if (days > 0)  parts.push(`${days}d`);
  if (hrs > 0)   parts.push(`${hrs}h`);
  if (mins > 0)  parts.push(`${mins}m`);
  return parts.join(' ') || 'Less than a minute!';
}

module.exports = {
  name: 'countdown',
  aliases: ['timer', 'event', 'eventcountdown'],
  description: '⏳ Group event countdown timers',
  category: 'tools',

  execute: async ({ from, args, reply, isAdmin, isOwner }) => {
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'set' || sub === 'add') {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only can add countdowns.');
      // Parse: set "Event Name" YYYY-MM-DD
      const raw = args.slice(1).join(' ');
      const nameMatch = raw.match(/^"([^"]+)"\s*(.+)$/) || raw.match(/^([^"]\S+(?:\s+\S+)*?)\s+(\d{4}-\d{2}-\d{2}.*)$/);
      if (!nameMatch) {
        return reply(
          '⏳ *Add Countdown*\n\n' +
          'Usage: *.countdown set "Event Name" YYYY-MM-DD*\n\n' +
          'Examples:\n' +
          '  *.countdown set "Christmas" 2026-12-25*\n' +
          '  *.countdown set "Exams" 2026-06-01*'
        );
      }
      const name = nameMatch[1].trim();
      const dateStr = nameMatch[2].trim();
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return reply('❌ Invalid date format. Use YYYY-MM-DD (e.g. 2026-12-25)');

      const cds = getCDs(from);
      if (cds.length >= 10) return reply('❌ Max 10 countdowns. Remove one first: *.countdown delete <n>*');
      cds.push({ name, timestamp: date.getTime(), createdAt: Date.now() });
      saveCDs(from, cds);

      const left = formatCountdown(date.getTime() - Date.now());
      return reply(`✅ Countdown set!\n\n⏳ *${name}*\n📅 ${dateStr}\n🕐 In: *${left}*`);
    }

    if (sub === 'delete' || sub === 'del' || sub === 'remove') {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const n = parseInt(args[1]);
      const cds = getCDs(from);
      if (!cds.length) return reply('⏳ No countdowns to delete.');
      if (isNaN(n) || n < 1 || n > cds.length) return reply(`⏳ Invalid number. Use 1–${cds.length}`);
      const removed = cds.splice(n - 1, 1)[0];
      saveCDs(from, cds);
      return reply(`🗑️ Removed countdown: *${removed.name}*`);
    }

    // Show all (default)
    const cds = getCDs(from);
    if (!cds.length) {
      return reply('⏳ No countdowns set.\n\nAdd one: *.countdown set "Christmas" 2026-12-25*');
    }
    const now = Date.now();
    const lines = cds.map((cd, i) => {
      const left = cd.timestamp - now;
      const dateStr = new Date(cd.timestamp).toLocaleDateString('en-ZA');
      return `${i + 1}. ⏳ *${cd.name}*\n   📅 ${dateStr} — *${formatCountdown(left)}*`;
    });
    return reply(`⏳ *Event Countdowns (${cds.length})*\n\n${lines.join('\n\n')}`);
  },
};
