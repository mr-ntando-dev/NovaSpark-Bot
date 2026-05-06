/**
 * ⚡ NovaSpark v4 — Profile Card
 * .profile [@user]
 * Shows rich profile: name, number, bot stats, warns, plan, join date
 * NEVER SEEN in any other WhatsApp MD bot.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const config   = require('../../config');

module.exports = {
  name: 'profile',
  aliases: ['me', 'card', 'whoami'],
  description: '🪪 View your (or another user\'s) detailed bot profile card',
  category: 'tools',

  execute: async ({ sock, msg, from, sender, args, reply, mentions }) => {
    const target = mentions?.[0] || sender;
    const num    = target.split('@')[0];
    const isPremium = true; // All users enjoy Premium for free
    const isOwner   = (Array.isArray(config.ownerNumber)
      ? config.ownerNumber : [config.ownerNumber]).includes(num);

    // Stats from analytics
    const analytics = database.getUserAnalytics ? database.getUserAnalytics(target) : {};
    const cmdUsed   = analytics.commandCount || 0;
    const msgSent   = analytics.messageCount || 0;

    // Warns (across all groups bot is in — just show total)
    const profile  = database.getUserProfile ? database.getUserProfile(target) : {};
    const joinDate = profile.joinDate
      ? new Date(profile.joinDate).toLocaleDateString('en-ZA', { year:'numeric', month:'short', day:'numeric' })
      : 'Unknown';

    const triviaScore = profile.triviaScore || 0;
    const triviaTotal = profile.triviaTotal || 0;
    const rps = profile.rps || { wins: 0, losses: 0 };

    const plan = isOwner ? '👑 Owner' : isPremium ? '💎 Premium' : '🆓 Free';

    return reply(
      `🪪 *Profile Card*\n` +
      `${'━'.repeat(30)}\n\n` +
      `📱 *Number:* +${num}\n` +
      `🏷️  *Plan:* ${plan}\n` +
      `📅 *First seen:* ${joinDate}\n\n` +
      `${'─'.repeat(26)}\n` +
      `💬 *Messages sent:* ${msgSent}\n` +
      `⚡ *Commands used:* ${cmdUsed}\n\n` +
      `🎮 *Games*\n` +
      `  🧠 Trivia: ${triviaScore}/${triviaTotal} correct\n` +
      `  🪨 RPS: ${rps.wins}W / ${rps.losses}L\n\n` +
      `${'━'.repeat(30)}\n` +
      `_⚡ NovaSpark Bot v4_`
    );
  },
};
