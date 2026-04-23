/**
 * ⚡ NovaSpark v9 — Pin Message Board
 * .pin — Pin the replied-to message (admin)
 * .pins — Show all pinned messages
 * .unpin <n> — Unpin message by number (admin)
 * .unpinall — Clear all pinned messages (admin)
 * Stored in DB — survives restarts.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const KEY = (gid) => `pins_${gid}`;

module.exports = [
  {
    name: 'pin',
    aliases: ['pinmessage', 'pinmsg'],
    description: '📌 Pin a message to the group board',
    category: 'group',
    adminOnly: true,

    execute: async ({ sock, msg, from, sender, args, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedText = quoted?.conversation
        || quoted?.extendedTextMessage?.text
        || quoted?.imageMessage?.caption
        || quoted?.videoMessage?.caption;

      if (!quotedText) return reply('📌 Reply to a message to pin it!\n\nUsage: *.pin* (while replying to a message)');

      const pins = database.getSetting(KEY(from)) || [];
      if (pins.length >= 10) return reply('📌 Max 10 pins reached. Use *.unpin <n>* to remove one first.');

      pins.push({
        text: quotedText,
        pinnedBy: sender.split('@')[0],
        pinnedAt: new Date().toLocaleDateString('en-ZA'),
        n: pins.length + 1,
      });
      database.setSetting(KEY(from), pins);

      return reply(`📌 *Message pinned!* (Pin #${pins.length})\n\nView all: *.pins*`);
    },
  },

  {
    name: 'pins',
    aliases: ['pinlist', 'showpins'],
    description: '📌 Show all pinned messages',
    category: 'group',

    execute: async ({ from, reply }) => {
      const pins = database.getSetting(KEY(from)) || [];
      if (!pins.length) return reply('📌 No pinned messages.\n\nAdmins can pin with *.pin* (while replying to a message)');

      const lines = pins.map((p, i) =>
        `📌 *Pin ${i + 1}*\n"${p.text.slice(0, 200)}${p.text.length > 200 ? '...' : ''}"\n_by @${p.pinnedBy} on ${p.pinnedAt}_`
      );

      return reply(`📌 *Pinned Messages (${pins.length})*\n\n${lines.join('\n\n')}`);
    },
  },

  {
    name: 'unpin',
    aliases: ['unpinmessage'],
    description: '📌 Unpin a message by number',
    category: 'group',
    adminOnly: true,

    execute: async ({ from, args, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const n = parseInt(args[0]);
      const pins = database.getSetting(KEY(from)) || [];
      if (!pins.length) return reply('📌 No pinned messages.');
      if (isNaN(n) || n < 1 || n > pins.length) return reply(`📌 Invalid pin number. Use 1–${pins.length}`);
      pins.splice(n - 1, 1);
      database.setSetting(KEY(from), pins);
      return reply(`🗑️ Pin #${n} removed. Remaining: ${pins.length}`);
    },
  },

  {
    name: 'unpinall',
    aliases: ['clearpins'],
    description: '📌 Clear all pinned messages',
    category: 'group',
    adminOnly: true,

    execute: async ({ from, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      database.setSetting(KEY(from), []);
      return reply('🗑️ All pinned messages cleared!');
    },
  },
];
