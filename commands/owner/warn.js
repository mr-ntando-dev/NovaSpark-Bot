/**
 * ⚡ NovaSpark v4 — Warn System
 * .warn @user [reason] | .warns @user | .clearwarn @user
 * Configurable max warns per group (.setwarnlimit N)
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = [
  {
    name: 'warn',
    aliases: [],
    description: '⚠️ Warn a group member (auto-kick at max warns)',
    category: 'owner',
    adminOnly: true,

    execute: async ({ sock, msg, from, sender, args, reply, isAdmin, isBotAdmin, mentions }) => {
      if (!isBotAdmin) return reply('🤖 I need admin rights!');
      if (!isAdmin)    return reply('🛡️ Admins only!');
      const target = mentions?.[0];
      if (!target) return reply('⚠️ Tag the user to warn: `.warn @user [reason]`');
      const reason  = args.filter(a => !a.startsWith('@')).join(' ') || 'No reason given';
      const gs      = database.getGroupSettings(from);
      const maxWarn = gs.maxWarn || 3;
      const count   = database.addWarn(from, target, reason);
      const num     = target.split('@')[0];

      if (count >= maxWarn) {
        try { await sock.groupParticipantsUpdate(from, [target], 'remove'); } catch {}
        database.clearWarns(from, target);
        return await sock.sendMessage(from, {
          text: `🚫 @${num} reached *${maxWarn} warns* and was removed.\n_Reason: ${reason}_`,
          mentions: [target],
        });
      }

      return await sock.sendMessage(from, {
        text:
          `⚠️ *Warning ${count}/${maxWarn}*\n\n` +
          `@${num} — *${reason}*\n\n` +
          `_${maxWarn - count} warn(s) left before removal._`,
        mentions: [target],
      });
    },
  },

  {
    name: 'warns',
    aliases: ['checkwarn'],
    description: '📋 Check a user\'s warning count',
    category: 'owner',
    adminOnly: true,

    execute: async ({ sock, msg, from, args, reply, mentions }) => {
      const target = mentions?.[0];
      if (!target) return reply('Tag the user: `.warns @user`');
      const list = database.getWarns(from, target);
      const gs   = database.getGroupSettings(from);
      const max  = gs.maxWarn || 3;
      if (!list.length) return reply(`✅ @${target.split('@')[0]} has no warnings.`);
      const detail = list.map((w, i) => `  ${i+1}. ${w.reason || 'No reason'}`).join('\n');
      return await sock.sendMessage(from, {
        text: `⚠️ *Warns for @${target.split('@')[0]}*: *${list.length}/${max}*\n\n${detail}`,
        mentions: [target],
      });
    },
  },

  {
    name: 'clearwarn',
    aliases: ['resetwarn'],
    description: '✅ Clear all warnings for a user',
    category: 'owner',
    adminOnly: true,

    execute: async ({ sock, msg, from, reply, mentions }) => {
      const target = mentions?.[0];
      if (!target) return reply('Tag the user: `.clearwarn @user`');
      database.clearWarns(from, target);
      return await sock.sendMessage(from, {
        text: `✅ Warnings cleared for @${target.split('@')[0]}.`,
        mentions: [target],
      });
    },
  },

  {
    name: 'setwarnlimit',
    aliases: ['maxwarn', 'warnlimit'],
    description: '⚙️ Set max warnings before auto-kick',
    category: 'owner',
    adminOnly: true,

    execute: async ({ from, args, reply }) => {
      const n = parseInt(args[0]);
      if (!n || n < 1 || n > 20) return reply('Usage: `.setwarnlimit <1-20>`\nExample: `.setwarnlimit 5`');
      database.updateGroupSettings(from, { maxWarn: n });
      return reply(`⚙️ Warn limit set to *${n}*. Members will be kicked after ${n} warnings.`);
    },
  },
];
