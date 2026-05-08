/**
 * ⚡ NovaSpark Bot — Warn List
 * .warnlist  — shows all warned members in the group with warn counts
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

module.exports = {
  name: 'warnlist',
  aliases: ['warns', 'warnslist', 'showwarns'],
  category: 'group',
  description: 'Show all warned members and their warning counts',
  usage: '.warnlist',
  adminOnly: true,
  groupOnly: true,

  async execute({ reply, from, groupMeta }) {
    const db      = database.getGroupSettings(from) || {};
    const warns   = db.warns || {};
    const entries = Object.entries(warns).filter(([, v]) => v > 0);

    if (!entries.length) {
      return reply('✅ No warned members in this group. Everyone is behaving!');
    }

    entries.sort((a, b) => b[1] - a[1]);

    const participants = groupMeta?.participants || [];
    const nameMap      = {};
    participants.forEach(p => { nameMap[p.id] = p.notify || p.id.split('@')[0]; });

    const lines = entries.map(([jid, count], i) => {
      const name  = nameMap[jid] || jid.split('@')[0];
      const stars = '⭐'.repeat(Math.min(count, 5));
      return `${i + 1}. @${jid.split('@')[0]}  —  *${count} warn(s)* ${stars}`;
    });

    const mentions = entries.map(([jid]) => jid);

    await (require('../../config'), true) && null; // no-op to keep import consistent
    return { text: `⚠️ *Warning List — ${groupMeta?.subject || 'Group'}*\n\n${lines.join('\n')}\n\n_Max warns before kick: 3_`, mentions };
  },

  async executeFull({ sock, msg, from, reply, groupMeta }) {
    const database  = require('../../database');
    const db        = database.getGroupSettings ? database.getGroupSettings(from) : {};
    const warns     = db?.warns || {};
    const entries   = Object.entries(warns).filter(([, v]) => v > 0);

    if (!entries.length) {
      return reply('✅ No warned members in this group. Everyone is behaving! 🎉');
    }

    entries.sort((a, b) => b[1] - a[1]);
    const lines    = entries.map(([jid, count], i) =>
      `${i + 1}. @${jid.split('@')[0]} — *${count} warn(s)* ${'⭐'.repeat(Math.min(count, 5))}`
    );
    const mentions = entries.map(([jid]) => jid);

    await sock.sendMessage(from, {
      text: `⚠️ *Warning List — ${groupMeta?.subject || 'Group'}*\n\n${lines.join('\n')}\n\n_Kick threshold: 3 warns_`,
      mentions,
    }, { quoted: msg });
  },
};
