/**
 * ⚡ NovaSpark v4 — Welcome / Goodbye
 * .welcome on/off [custom message]
 * .goodbye on/off [custom message]
 * Sends rich welcome card with member stats when someone joins.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = [
  {
    name: 'welcome',
    aliases: ['setwelcome'],
    description: 'Welcome new members with a custom message',
    category: 'group',
    adminOnly: true,

    execute: async ({ sock, msg, from, args, body, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const sub = (args[0] || '').toLowerCase();
      if (!['on', 'off'].includes(sub)) {
        const gs = database.getGroupSettings(from);
        return reply(
          `👋 *Welcome System*\n\nStatus: *${gs.welcome ? 'ON ✅' : 'OFF ❌'}*\n\n` +
          'Usage:\n' +
          '  `.welcome on` — Enable default welcome\n' +
          '  `.welcome on Hi @user! Welcome to @group 🎉` — Custom message\n' +
          '  `.welcome off` — Disable\n\n' +
          'Variables: `@user` `@group` `@count` `@date`'
        );
      }
      if (sub === 'off') {
        database.updateGroupSettings(from, { welcome: false });
        return reply('👋 Welcome messages: OFF');
      }
      const custom = args.slice(1).join(' ').trim();
      database.updateGroupSettings(from, { welcome: true, welcomeMsg: custom || '' });
      return reply(
        `👋 *Welcome: ON* ✅\n` +
        (custom ? `Message: _"${custom}"_` : '_Using default welcome card._')
      );
    },
  },

  {
    name: 'goodbye',
    aliases: ['setgoodbye'],
    description: 'Send goodbye message when members leave',
    category: 'group',
    adminOnly: true,

    execute: async ({ sock, msg, from, args, body, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const sub = (args[0] || '').toLowerCase();
      if (!['on', 'off'].includes(sub)) {
        const gs = database.getGroupSettings(from);
        return reply(
          `👋 *Goodbye System*\n\nStatus: *${gs.goodbye ? 'ON ✅' : 'OFF ❌'}*\n\n` +
          'Usage:\n  `.goodbye on`\n  `.goodbye off`\n  `.goodbye on Bye @user! 👋`'
        );
      }
      if (sub === 'off') {
        database.updateGroupSettings(from, { goodbye: false });
        return reply('👋 Goodbye messages: OFF');
      }
      const custom = args.slice(1).join(' ').trim();
      database.updateGroupSettings(from, { goodbye: true, goodbyeMsg: custom || '' });
      return reply(`👋 *Goodbye: ON* ✅`);
    },
  },
];
