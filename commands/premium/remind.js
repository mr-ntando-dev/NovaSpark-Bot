'use strict';
const database = require('../../database');

const parseTime = (timeStr) => {
  const m = timeStr.match(/^(\d+)(s|m|h|d)$/i);
  if (!m) return null;
  const val  = parseInt(m[1]);
  const unit = m[2].toLowerCase();
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Date.now() + val * mult[unit];
};

const timeLabel = (timeStr) => {
  return timeStr
    .replace(/(\d+)s$/, '$1 seconds')
    .replace(/(\d+)m$/, '$1 minutes')
    .replace(/(\d+)h$/, '$1 hours')
    .replace(/(\d+)d$/, '$1 days');
};

module.exports = {
  name: 'premiumremind',
  aliases: ['premiumreminder', 'premiumremindme'],
  description: '[PREMIUM] Set a reminder — .remind 30m Study for math',
  category: 'premium',
  execute: async ({ sender, args, reply }) => {
    const userId = sender.split('@')[0];
    // All users enjoy Premium for free
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'list') {
      const reminders = database.getUserReminders(userId);
      if (!reminders.length) return reply('🔔 You have no pending reminders.');
      const list = reminders.map((r, i) => {
        const when = new Date(r.triggerAt).toLocaleString();
        return `${i + 1}. _${r.message}_ — ${when}`;
      }).join('\n');
      return reply(`🔔 *Your Pending Reminders:*\n\n${list}`);
    }

    if (args.length < 2) {
      return reply(
        '🔔 Usage: *.remind <time> <message>*\n\n' +
        'Time formats: 30s, 5m, 2h, 1d\n\n' +
        'Examples:\n' +
        '  .remind 30m Study for math test\n' +
        '  .remind 2h Submit assignment\n' +
        '  .remind 1d Review notes\n\n' +
        'Type *.remind list* to see pending reminders.'
      );
    }

    database.logCommand(sender, 'premiumremind');
    const time    = args[0];
    const message = args.slice(1).join(' ');
    const trigger = parseTime(time);
    if (!trigger) return reply('❌ Invalid time format. Use: 30s, 5m, 2h, 1d');

    database.addReminder(userId, from, message, trigger);

    await reply(
      `🔔 *Reminder Set!*\n\n` +
      `📌 Message: _${message}_\n` +
      `⏰ In: *${timeLabel(time)}*\n\n` +
      `_I'll ping you when it's time!_

_Nova AI ⚡_`
    );
  },
};
