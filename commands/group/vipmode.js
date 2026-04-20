/**
 * ⚡ NovaSpark v4 — VIP Mode
 * .vip on/off | .vip add @user | .vip remove @user | .vip list
 * Only VIP members (+ admins) can send messages when VIP mode is on.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'vip',
  aliases: ['vipmode'],
  description: 'VIP-only mode — restrict messaging to VIP members',
  category: 'group',
  adminOnly: true,

  execute: async ({ sock, msg, from, sender, args, body, reply, isAdmin, isBotAdmin, mentions }) => {
    if (!isBotAdmin) return reply('🤖 I need admin rights!');
    if (!isAdmin)    return reply('🛡️ Admins only!');

    const sub  = (args[0] || '').toLowerCase();
    const gs   = database.getGroupSettings(from);
    const vips = gs.vipList || [];

    if (sub === 'on') {
      database.updateGroupSettings(from, { vipOnly: true });
      return reply(
        '⭐ *VIP Mode: ON*\n\nOnly VIP members and admins can send messages.\nUse `.vip add @user` to grant VIP access.'
      );
    }
    if (sub === 'off') {
      database.updateGroupSettings(from, { vipOnly: false });
      return reply('⭐ *VIP Mode: OFF* — All members can chat again.');
    }
    if (sub === 'add') {
      const targets = mentions?.length ? mentions : [];
      if (!targets.length) return reply('Tag the user(s) to add as VIP: `.vip add @user`');
      const newVips = [...new Set([...vips, ...targets])];
      database.updateGroupSettings(from, { vipList: newVips });
      const nums = targets.map(j => '@' + j.split('@')[0]);
      return reply(`⭐ VIP granted to: ${nums.join(', ')}`, targets);
    }
    if (sub === 'remove') {
      const targets = mentions?.length ? mentions : [];
      if (!targets.length) return reply('Tag the user(s) to remove from VIP: `.vip remove @user`');
      const newVips = vips.filter(j => !targets.includes(j));
      database.updateGroupSettings(from, { vipList: newVips });
      const nums = targets.map(j => '@' + j.split('@')[0]);
      return reply(`🚫 VIP removed from: ${nums.join(', ')}`, targets);
    }
    if (sub === 'list') {
      if (!vips.length) return reply('⭐ No VIP members yet. Use `.vip add @user`');
      const list = vips.map((j, i) => `${i + 1}. +${j.split('@')[0]}`).join('\n');
      return reply(`⭐ *VIP Members*\n\n${list}\n\n_VIP Mode: ${gs.vipOnly ? 'ON ✅' : 'OFF ❌'}_`);
    }

    return reply(
      '⭐ *VIP Mode Commands*\n\n' +
      '`.vip on` — Enable VIP-only mode\n' +
      '`.vip off` — Disable VIP-only mode\n' +
      '`.vip add @user` — Grant VIP\n' +
      '`.vip remove @user` — Revoke VIP\n' +
      '`.vip list` — Show all VIPs'
    );
  },
};
