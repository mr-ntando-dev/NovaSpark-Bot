/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .mutelist — Show currently muted members in the group
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

module.exports = {
  name: 'mutelist',
  aliases: ['muteusers', 'whosmuted', 'silenced'],
  description: '🔇 List currently muted members in the group',
  category: 'group',
  groupOnly: true,
  adminOnly: true,

  execute: async ({ sock, from, reply, groupMeta }) => {
    const gs = database.getGroupSettings(from);

    // Support both array-based and object-based muted storage
    const muted = gs.mutedMembers || gs.muted || [];
    const mutedList = Array.isArray(muted) ? muted : Object.keys(muted);

    if (!mutedList.length) {
      return reply(`✅ *No muted members* in this group.\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    }

    // Try to resolve names from group metadata
    let list = `🔇 *Muted Members*\n${'━'.repeat(28)}\n\n`;

    mutedList.forEach((jid, i) => {
      const participant = groupMeta?.participants?.find(p => p.id === jid || p.id.split('@')[0] === jid.split('@')[0]);
      const name = participant?.notify || `+${jid.split('@')[0]}`;
      list += `${i + 1}. @${jid.split('@')[0]} (${name})\n`;
    });

    list += `\n📊 *Total:* ${mutedList.length} member(s)\n`;
    list += `\n_⚡ NovaSpark Bot — Dev-Ntando_`;

    return sock.sendMessage(from, {
      text: list,
      mentions: mutedList,
    });
  },
};
