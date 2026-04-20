/**
 * ⚡ NovaSpark v4 — Ghost Mode
 * .ghost on/off
 * Bot reads all messages and processes commands WITHOUT showing
 * typing indicators or read receipts. The bot appears offline.
 * NEVER SEEN before in any MD bot.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'ghost',
  aliases: ['ghostmode', 'invisible'],
  description: 'Ghost mode — bot acts silently, no typing indicator or read receipts',
  category: 'group',
  adminOnly: false,

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(sub)) {
      const gs = database.getGroupSettings(from);
      return reply(
        `👻 *Ghost Mode*\n\nCurrent: *${gs.ghostMode ? 'ON 👻' : 'OFF 👁️'}*\n\n` +
        'Usage:\n  `.ghost on` — Bot acts invisibly\n  `.ghost off` — Bot acts normally\n\n' +
        '_In ghost mode: no typing indicators, no read receipts, commands still work silently._'
      );
    }

    database.updateGroupSettings(from, { ghostMode: sub === 'on' });
    if (sub === 'on') {
      return reply(
        '👻 *Ghost Mode: ON*\n\n' +
        'I am now invisible.\n' +
        '• No typing indicators\n' +
        '• No read receipts\n' +
        '• Commands still work silently\n\n' +
        '_People won\'t even know I\'m watching_ 👁️'
      );
    } else {
      return reply('👁️ *Ghost Mode: OFF* — I\'m visible again.');
    }
  },
};
