/**
 * ⚡ NovaSpark v4 — Night Mode
 * .nightmode on/off [start] [end]
 * Auto-mutes group at a set time and unmutes at wake time.
 * Checks every minute via the interval started in handler.js
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'nightmode',
  aliases: ['night'],
  description: 'Auto-mute group at night and unmute in the morning',
  category: 'group',
  adminOnly: true,

  execute: async ({ sock, msg, from, sender, args, reply, isAdmin, isBotAdmin }) => {
    if (!isBotAdmin) return reply('🤖 I need admin rights to use Night Mode!');
    if (!isAdmin) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(sub)) {
      return reply(
        '🌙 *Night Mode*\n\n' +
        'Usage:\n' +
        '  `.nightmode on [22:00] [06:00]`\n' +
        '  `.nightmode off`\n\n' +
        'Auto-mutes the group at start time and unmutes at end time.\n' +
        '_Default: 22:00 → 06:00_'
      );
    }

    const start = args[1] || '22:00';
    const end   = args[2] || '06:00';

    database.updateGroupSettings(from, {
      nightMode:  sub === 'on',
      nightStart: start,
      nightEnd:   end,
    });

    if (sub === 'on') {
      return reply(
        `🌙 *Night Mode ON*\n\n` +
        `😴 Mute time:   *${start}*\n` +
        `🌅 Wake time:   *${end}*\n\n` +
        `_Non-admins will be silenced at ${start} and unmuted at ${end} daily._`
      );
    } else {
      return reply('☀️ *Night Mode OFF* — Group back to normal schedule.');
    }
  },
};
