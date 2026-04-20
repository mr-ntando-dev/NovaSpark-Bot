/**
 * ⚡ NovaSpark Bot v5 — My Activity
 * Shows your message count and rank in a group today
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'myactivity',
  aliases: ['myrank', 'mymsgs', 'rank', 'activity'],
  category: 'general',
  description: 'Check your message activity and rank in this group',
  usage: '.myactivity',
  groupOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const stats = database.getGroupStats ? database.getGroupStats(extra.from) : null;

      if (!stats || !stats.users || !stats.users[extra.sender]) {
        return extra.reply('📊 You haven\'t sent any messages today yet! Start chatting.');
      }

      const userCount    = stats.users[extra.sender];
      const totalMessages = stats.total || 1;
      const pct          = ((userCount / totalMessages) * 100).toFixed(1);
      const sorted       = Object.entries(stats.users).sort((a, b) => b[1] - a[1]);
      const rank         = sorted.findIndex(([id]) => id === extra.sender) + 1;
      const tag          = `@${extra.sender.split('@')[0]}`;

      await sock.sendMessage(extra.from, {
        text:
          `📊 *Activity Stats*\n` +
          `${'─'.repeat(28)}\n\n` +
          `👤 User: ${tag}\n` +
          `📝 Messages today: *${userCount}*\n` +
          `📈 Group share: *${pct}%*\n` +
          `🏆 Rank: *#${rank}* of ${sorted.length} members\n\n` +
          `_Keep chatting! 💬_`,
        mentions: [extra.sender],
      }, { quoted: msg });
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
