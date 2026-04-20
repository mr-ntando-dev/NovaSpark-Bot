/**
 * ⚡ NovaSpark v4 — Set Premium (Owner)
 * .setpremium add @user | remove @user | list
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'setpremium',
  aliases: ['premium'],
  description: '💎 Manage premium users',
  category: 'owner',
  ownerOnly: true,

  execute: async ({ sock, msg, from, args, reply, mentions }) => {
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'list') {
      const list = database.listPremium();
      if (!list.length) return reply('💎 No premium users yet.');
      return reply(`💎 *Premium Users (${list.length})*\n\n` + list.map((j,i) => `${i+1}. +${j.split('@')[0]}`).join('\n'));
    }

    if (sub === 'add') {
      const targets = mentions?.length ? mentions : [];
      if (!targets.length) return reply('Tag user(s): `.setpremium add @user`');
      targets.forEach(j => database.addPremium(j));
      return reply(`💎 Premium granted to: ${targets.map(j => '+' + j.split('@')[0]).join(', ')}`);
    }

    if (sub === 'remove') {
      const targets = mentions?.length ? mentions : [];
      if (!targets.length) return reply('Tag user(s): `.setpremium remove @user`');
      targets.forEach(j => database.removePremium(j));
      return reply(`✅ Premium removed from: ${targets.map(j => '+' + j.split('@')[0]).join(', ')}`);
    }

    return reply(
      '💎 *Premium Manager*\n\n' +
      '`.setpremium add @user` — Grant premium\n' +
      '`.setpremium remove @user` — Revoke premium\n' +
      '`.setpremium list` — List all premium users'
    );
  },
};
