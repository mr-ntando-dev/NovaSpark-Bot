/**
 * ⚡ NovaSpark Bot v5 — Top Members
 * Leaderboard of most active group members today
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
  name: 'topmembers',
  aliases: ['topusers', 'leaderboard', 'top', 'top10'],
  category: 'general',
  description: 'Show most active members leaderboard',
  usage: '.topmembers',
  groupOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const stats = database.getGroupStats ? database.getGroupStats(extra.from) : null;

      if (!stats || !stats.users || Object.keys(stats.users).length === 0) {
        return extra.reply('📊 No activity data yet! Start chatting to build the leaderboard.');
      }

      const sorted   = Object.entries(stats.users).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const mentions = sorted.map(([id]) => id);
      const total    = stats.total || 1;

      let text = `🏆 *Top Members Today*\n${'─'.repeat(28)}\n\n`;
      sorted.forEach(([id, count], i) => {
        const num = id.split('@')[0];
        const pct = ((count / total) * 100).toFixed(1);
        text += `${MEDALS[i] || `${i + 1}.`} @${num} — *${count}* msgs (${pct}%)\n`;
      });

      text += `\n_Total messages: ${total}_\n_⚡ NovaSpark Bot_`;

      await sock.sendMessage(extra.from, { text, mentions }, { quoted: msg });
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
