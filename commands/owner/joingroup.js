/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .joingroup <invite link> — Make bot join a group via invite link (Owner only)
 * .leavegroup [group id] — Make bot leave a specific group (Owner only)
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = [
  {
    name: 'joingroup',
    aliases: ['joingc', 'joinlink'],
    description: '🔗 Join a group via invite link',
    category: 'owner',
    ownerOnly: true,

    execute: async ({ sock, args, reply, sender }) => {
      const ownerNums = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
      const senderNum = sender.split('@')[0].split(':')[0];
      if (!ownerNums.map(String).includes(senderNum)) return reply('🚫 Owner only command.');

      const link = args[0];
      if (!link) return reply('Usage: `.joingroup <invite link>`\nExample: `.joingroup https://chat.whatsapp.com/xxxxxx`');

      const code = link.replace(/https?:\/\/chat\.whatsapp\.com\//i, '').trim();
      if (!code) return reply('❌ Invalid invite link format.');

      try {
        await sock.groupAcceptInvite(code);
        return reply(`✅ *Bot successfully joined the group!*\n_⚡ NovaSpark Bot_`);
      } catch (e) {
        return reply(`❌ Failed to join group: ${e.message}`);
      }
    },
  },

  {
    name: 'leavegroup',
    aliases: ['leavegc', 'botleave'],
    description: '🚪 Make bot leave a group',
    category: 'owner',
    ownerOnly: true,

    execute: async ({ sock, from, args, reply, sender }) => {
      const ownerNums = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
      const senderNum = sender.split('@')[0].split(':')[0];
      if (!ownerNums.map(String).includes(senderNum)) return reply('🚫 Owner only command.');

      const target = args[0] || from;
      try {
        await reply('👋 *Bot is leaving this group. Goodbye!*\n_⚡ NovaSpark Bot_');
        await sock.groupLeave(target);
      } catch (e) {
        return reply(`❌ Failed to leave group: ${e.message}`);
      }
    },
  },
];
