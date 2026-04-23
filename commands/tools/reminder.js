/**
 * ⚡ NovaSpark v9 — Smart Reminder (Free tier upgrade)
 * .reminder set 10m Do homework
 * .reminder set 2h Call mom
 * .reminder set 30s Test
 * .reminder list — View your pending reminders
 * .reminder clear — Clear all your reminders
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

function parseTime(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const n = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * mult[unit];
}

module.exports = {
  name: 'reminder',
  aliases: ['remind', 'remindme', 'setreminder'],
  description: '⏰ Set a reminder — works for everyone, free!',
  category: 'tools',

  execute: async ({ from, sender, args, reply }) => {
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'list') {
      const reminders = database.getReminders ? database.getReminders(sender) : [];
      if (!reminders.length) return reply('⏰ You have no pending reminders.\n\nSet one: *.reminder set 30m Call John*');
      const lines = reminders.map((r, i) => {
        const left = Math.max(0, Math.ceil((r.triggerAt - Date.now()) / 60000));
        return `${i + 1}. "${r.msg}" — in *${left}m*`;
      });
      return reply(`⏰ *Your Reminders*\n\n${lines.join('\n')}`);
    }

    if (sub === 'clear') {
      if (database.clearReminders) database.clearReminders(sender);
      return reply('🗑️ All your reminders cleared!');
    }

    if (sub === 'set') {
      const timeStr = args[1];
      const message = args.slice(2).join(' ').trim();
      if (!timeStr || !message) {
        return reply(
          '⏰ *Reminder Setup*\n\n' +
          'Usage: *.reminder set <time> <message>*\n\n' +
          'Examples:\n' +
          '  *.reminder set 10m Check the oven*\n' +
          '  *.reminder set 2h Call John*\n' +
          '  *.reminder set 1d Pay rent*\n\n' +
          'Time units: *s* (sec) • *m* (min) • *h* (hour) • *d* (day)'
        );
      }
      const delay = parseTime(timeStr);
      if (!delay) return reply('❌ Invalid time format. Use: *30s*, *10m*, *2h*, *1d*');
      if (delay > 7 * 86400000) return reply('❌ Max reminder time is 7 days.');

      const triggerAt = Date.now() + delay;
      const id = `${sender}_${Date.now()}`;
      if (database.addReminder) {
        database.addReminder({ id, jid: sender, chat: from, msg: message, triggerAt, done: false });
      }

      const humanTime = timeStr.replace(/(\d+)s/, '$1 seconds')
        .replace(/(\d+)m/, '$1 minutes')
        .replace(/(\d+)h/, '$1 hours')
        .replace(/(\d+)d/, '$1 days');

      return reply(`✅ *Reminder set!*\n\n⏰ I'll remind you in *${humanTime}*\n📝 "${message}"\n\n*.reminder list* to view all.`);
    }

    // Default help
    return reply(
      '⏰ *Reminder Commands*\n\n' +
      '*.reminder set 10m message* — Set a reminder\n' +
      '*.reminder list* — View your reminders\n' +
      '*.reminder clear* — Clear all reminders\n\n' +
      'Time units: *s* sec • *m* min • *h* hr • *d* day'
    );
  },
};
