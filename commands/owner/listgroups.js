/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .listgroups — List all groups the bot is in (Owner only)
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = {
  name: 'listgroups',
  aliases: ['mygroups', 'botgroups', 'allgroups'],
  description: '📋 List all groups the bot is currently in',
  category: 'owner',
  ownerOnly: true,

  execute: async ({ sock, from, reply, sender }) => {
    const ownerNums = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
    const senderNum = sender.split('@')[0].split(':')[0];
    if (!ownerNums.map(String).includes(senderNum)) return reply('🚫 Owner only command.');

    try {
      const chats  = await sock.groupFetchAllParticipating();
      const groups = Object.values(chats);
      if (!groups.length) return reply('📋 The bot is not in any groups.');

      let text = `📋 *Groups Bot Is In (${groups.length})*\n${'━'.repeat(30)}\n\n`;
      groups.forEach((g, i) => {
        text += `${i + 1}. *${g.subject}*\n   👥 ${g.participants?.length || '?'} members\n`;
      });
      text += `\n_⚡ NovaSpark Bot — Dev-Ntando_`;

      // Chunk if too long
      if (text.length > 4000) {
        text = text.slice(0, 4000) + '\n\n_[list truncated]_\n_⚡ NovaSpark Bot_';
      }
      return reply(text);
    } catch (e) {
      return reply(`❌ Could not fetch groups: ${e.message}`);
    }
  },
};
