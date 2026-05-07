/**
 * ⚡ NovaSpark Bot v8.0 — Auto Schedule Command
 * .autoschedule add <time HH:MM> <message>
 * .autoschedule list
 * .autoschedule remove <id>
 * Sends a message to a group/chat at a scheduled time every day
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const schedulers = new Map(); // in-memory timers

function getNextMs(hh, mm) {
  const now = new Date();
  const target = new Date();
  target.setHours(hh, mm, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

function startScheduler(sock, from, entry) {
  const key = `${from}::${entry.id}`;
  if (schedulers.has(key)) clearTimeout(schedulers.get(key));

  const fire = () => {
    sock.sendMessage(from, { text: entry.message }).catch(() => {});
    // re-schedule next day
    const ms = getNextMs(entry.hh, entry.mm);
    schedulers.set(key, setTimeout(fire, ms));
  };

  const ms = getNextMs(entry.hh, entry.mm);
  schedulers.set(key, setTimeout(fire, ms));
}

module.exports = {
  name: 'autoschedule',
  aliases: ['autoschedule2', 'autosched'],
  description: 'Schedule daily auto-messages to any chat',
  category: 'owner',
  ownerOnly: true,

  onStartup: async (sock) => {
    // Restore all schedules on bot start
    const all = database.getSchedules ? database.getSchedules() : [];
    for (const s of all) {
      startScheduler(sock, s.from, s);
    }
  },

  execute: async ({ sock, msg, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'add') {
      // .autoschedule add 08:00 Good morning everyone!
      const timeStr = args[1] || '';
      const message = args.slice(2).join(' ');
      if (!timeStr.includes(':') || !message) {
        return reply(
          '⏰ *Auto Schedule — Add*\n\n' +
          'Usage: `.autoschedule add HH:MM <message>`\n\n' +
          'Example:\n`.autoschedule add 08:00 🌅 Good morning everyone! Have a blessed day.`\n\n' +
          '_Runs every day at that time._'
        );
      }
      const [hh, mm] = timeStr.split(':').map(Number);
      if (isNaN(hh) || isNaN(mm) || hh > 23 || mm > 59) {
        return reply('❌ Invalid time format. Use HH:MM (24-hour).');
      }
      const id = Date.now().toString(36);
      const entry = { id, from, hh, mm, timeStr, message, createdAt: Date.now() };
      if (database.addSchedule) database.addSchedule(entry);
      startScheduler(sock, from, entry);
      return reply(
        `✅ *Schedule Added!*\n\n` +
        `🆔 ID: \`${id}\`\n` +
        `⏰ Time: *${timeStr}* daily\n` +
        `💬 Message: ${message}\n\n` +
        `_Use \`.autoschedule remove ${id}\` to cancel._`
      );
    }

    if (sub === 'list') {
      const all = (database.getSchedules ? database.getSchedules() : []).filter(s => s.from === from);
      if (!all.length) return reply('📭 No schedules set for this chat.');
      const lines = all.map(s => `• \`${s.id}\` — *${s.timeStr}* daily\n  ${s.message}`).join('\n\n');
      return reply(`⏰ *Active Schedules*\n\n${lines}`);
    }

    if (sub === 'remove') {
      const id = args[1];
      if (!id) return reply('❌ Provide the schedule ID. Use `.autoschedule list` to see IDs.');
      const key = `${from}::${id}`;
      if (schedulers.has(key)) { clearTimeout(schedulers.get(key)); schedulers.delete(key); }
      if (database.removeSchedule) database.removeSchedule(id);
      return reply(`🗑️ Schedule \`${id}\` removed.`);
    }

    return reply(
      '⏰ *Auto Schedule*\n\n' +
      '`.autoschedule add HH:MM <msg>` — Add daily schedule\n' +
      '`.autoschedule list` — View all schedules\n' +
      '`.autoschedule remove <id>` — Remove a schedule'
    );
  },
};
