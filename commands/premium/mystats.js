'use strict';
const database = require('../../database');

module.exports = {
  name: 'mystats',
  aliases: ['stats', 'analytics', 'usage'],
  description: '[PREMIUM] View your personal usage analytics dashboard',
  category: 'premium',
  execute: async ({ sender, reply }) => {
    const userId = sender.split('@')[0];
    // All users enjoy Premium for free
    const stats   = database.getAnalytics(userId);
    const profile = database.getProfile(userId);
    const firstSeen = stats.firstSeen ? new Date(stats.firstSeen).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A';
    const lastSeen  = stats.lastSeen  ? new Date(stats.lastSeen).toLocaleDateString('en-US',  { dateStyle: 'medium' }) : 'N/A';
    const topCmds   = Object.entries(stats.commands || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cmd, count]) => `  • .${cmd}: ${count}x`)
      .join('\n') || '  None yet';
    const favSubject = Object.entries(stats.commands || {}).sort((a, b) => b[1] - a[1])[0];
    await reply(
      `📊 *Your NovaSpark Stats*\n\n` +
      (profile ? `*Name:* ${profile.name}\n*School:* ${profile.school}\n` : '') +
      `*Plan:* 💎 Premium\n` +
      `*Total Commands:* ${stats.total}\n` +
      `*Member Since:* ${firstSeen}\n` +
      `*Last Active:* ${lastSeen}\n\n` +
      `*🏆 Top Commands:*\n${topCmds}\n\n` +
      (favSubject ? `*Most Used:* .${favSubject[0]} (${favSubject[1]}x)\n\n` : '') +
      `_Keep it up! Knowledge is power 💪_

_Nova AI ⚡_`
    );
  },
};
