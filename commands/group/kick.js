/**
 * ⚡ NovaSpark v4 — Kick / Promote / Demote / Mute / Unmute
 * Standard group admin tools done right.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

function makeCmd({ name, aliases, desc, update, successMsg, errMsg, adminOnly = true, botAdminNeeded = true }) {
  return {
    name, aliases,
    description: desc,
    category: 'group',
    adminOnly,
    execute: async ({ sock, msg, from, sender, args, body, reply, isAdmin, isBotAdmin, mentions }) => {
      if (!isBotAdmin && botAdminNeeded) return reply('🤖 I need admin rights!');
      if (!isAdmin) return reply('🛡️ Admins only!');
      const targets = mentions?.length ? mentions : [];
      if (!targets.length) return reply(`Tag the member(s): \`.${name} @user\``);
      try {
        await sock.groupParticipantsUpdate(from, targets, update);
        const nums = targets.map(j => `+${j.split('@')[0]}`).join(', ');
        return reply(successMsg(nums));
      } catch (e) {
        return reply(errMsg || '❌ Action failed. Check my admin rights.');
      }
    },
  };
}

module.exports = [
  makeCmd({
    name: 'kick', aliases: ['remove'],
    desc: '🚫 Remove member(s) from group',
    update: 'remove',
    successMsg: nums => `🚫 Removed: ${nums}`,
  }),
  makeCmd({
    name: 'kickpromote', aliases: ['kickma'],
    desc: '⬆️ Promote member to admin',
    update: 'kickpromote',
    successMsg: nums => `⬆️ Promoted: ${nums} 🎖️`,
  }),
  makeCmd({
    name: 'kickdemote', aliases: ['kickrma'],
    desc: '⬇️ Remove admin status',
    update: 'kickdemote',
    successMsg: nums => `⬇️ Demoted: ${nums}`,
  }),
  {
    name: 'kickmute',
    aliases: ['kicklock'],
    description: '🔇 Mute group (only admins can send)',
    category: 'group',
    adminOnly: true,
    execute: async ({ sock, from, reply, isAdmin, isBotAdmin }) => {
      if (!isBotAdmin) return reply('🤖 I need admin rights!');
      if (!isAdmin) return reply('🛡️ Admins only!');
      try {
        await sock.groupSettingUpdate(from, 'announcement');
        return reply('🔇 *Group muted.* Only admins can send messages.');
      } catch { return reply('❌ Could not mute group.'); }
    },
  },
  {
    name: 'kickunmute',
    aliases: ['kickunlock'],
    description: '🔊 Unmute group (all members can send)',
    category: 'group',
    adminOnly: true,
    execute: async ({ sock, from, reply, isAdmin, isBotAdmin }) => {
      if (!isBotAdmin) return reply('🤖 I need admin rights!');
      if (!isAdmin) return reply('🛡️ Admins only!');
      try {
        await sock.groupSettingUpdate(from, 'not_announcement');
        return reply('🔊 *Group unmuted.* All members can chat.');
      } catch { return reply('❌ Could not unmute group.'); }
    },
  },
  {
    name: 'kicktag',
    aliases: ['all', 'kickall'],
    description: '📢 Tag all group members',
    category: 'group',
    adminOnly: true,
    execute: async ({ sock, msg, from, args, reply, isAdmin }) => {
      if (!isAdmin) return reply('🛡️ Admins only!');
      const meta = await sock.groupMetadata(from).catch(() => null);
      if (!meta) return reply('❌ Could not fetch group info.');
      const members  = meta.participants.map(m => m.id);
      const message  = args.join(' ') || '📢 Attention everyone!';
      const mentions = members;
      const text     = message + '\n\n' + members.map(j => `@${j.split('@')[0]}`).join(' ');
      await sock.sendMessage(from, { text, mentions }, { quoted: msg });
    },
  },
];
