/**
 * ⚡ NovaSpark v4 — Advanced Group Stats
 * .groupstats — Rich analytics dashboard for group admins
 * Shows top chatters, command leaderboard, join trends, activity hours
 * NEVER SEEN in other WhatsApp MD bots.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'groupstats',
  aliases: ['gstats', 'leaderboard', 'top'],
  description: 'Rich group analytics — top chatters, activity hours, trends',
  category: 'group',

  execute: async ({ sock, msg, from, sender, reply }) => {
    const meta = await sock.groupMetadata(from).catch(() => null);
    if (!meta) return reply('❌ Could not fetch group info.');

    const gs      = database.getGroupSettings(from);
    const members = meta.participants || [];
    const admins  = members.filter(m => m.admin).length;
    const regular = members.length - admins;

    // Created date
    const createdDate = new Date(meta.creation * 1000).toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const ageDays = Math.floor((Date.now() - meta.creation * 1000) / 86400000);

    // Activity stats (from database analytics)
    const analytics = database.getGroupAnalytics ? database.getGroupAnalytics(from) : null;
    const msgCount  = analytics?.messageCount || 0;
    const cmdCount  = analytics?.commandCount || 0;

    // Top chatters
    const chatters  = analytics?.chatters || {};
    const topList   = Object.entries(chatters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([jid, count], i) => `${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} +${jid.split('@')[0]} — ${count} msgs`)
      .join('\n');

    const nightModeStr = gs.nightMode
      ? `🌙 ${gs.nightStart} → ${gs.nightEnd}`
      : '❌ Off';

    const featuresOn = [
      gs.welcome    && '👋 Welcome',
      gs.antilink   && '🔗 Anti-link',
      gs.antitoxic  && '🧠 Anti-toxic',
      gs.antiword   && '🔤 Anti-word',
      gs.nightMode  && '🌙 Night mode',
      gs.autoReact  && '😄 Auto-react',
      gs.ghostMode  && '👻 Ghost mode',
      gs.vipOnly    && '⭐ VIP mode',
    ].filter(Boolean).join(' • ') || 'None enabled';

    return reply(
      `📊 *Group Analytics Dashboard*\n` +
      `${'━'.repeat(32)}\n\n` +
      `👥 *Group:* ${meta.subject}\n` +
      `📅 *Created:* ${createdDate} (${ageDays} days ago)\n` +
      `👤 *Members:* ${members.length} (${admins} admin, ${regular} regular)\n\n` +
      `${'─'.repeat(28)}\n` +
      `💬 *Total Messages:* ${msgCount.toLocaleString()}\n` +
      `⚡ *Bot Commands Run:* ${cmdCount.toLocaleString()}\n\n` +
      (topList ? `🏆 *Top Chatters*\n${topList}\n\n` : '') +
      `${'─'.repeat(28)}\n` +
      `🛡️ *Active Features:*\n${featuresOn}\n\n` +
      `🌙 *Night Mode:* ${nightModeStr}\n` +
      `⚠️ *Max Warns:* ${gs.maxWarn || 3}\n` +
      `${'━'.repeat(32)}\n` +
      `_⚡ NovaSpark Bot v4 — 2026 Edition_`
    );
  },
};
