/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .listwarn — List all warned users in a group
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'listwarn',
  aliases: ['allwarns', 'warnedlist'],
  description: '📋 List all warned members in the group',
  category: 'group',
  adminOnly: true,

  execute: async ({ sock, from, reply, isGroup, isAdmin }) => {
    if (!isGroup) return reply('❌ Group only command.');
    if (!isAdmin) return reply('🛡️ Admins only!');

    // Use the warns storage from database
    const allData = database.getAllWarns ? database.getAllWarns(from) : {};
    const entries = Object.entries(allData);
    if (!entries.length) return reply('✅ No warned members in this group.');

    const gs  = database.getGroupSettings(from);
    const max = gs.maxWarn || 3;
    let list  = `⚠️ *Warned Members*\n${'━'.repeat(28)}\n\n`;

    entries.forEach(([jid, warns]) => {
      const count = Array.isArray(warns) ? warns.length : warns;
      list += `👤 +${jid.split('@')[0]} — ${count}/${max} warns\n`;
    });

    list += `\n_⚡ NovaSpark Bot — Dev-Ntando_`;
    return reply(list);
  },
};
