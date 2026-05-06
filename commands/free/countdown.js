/**
 * ⚡ NovaSpark Bot v5 — Countdown Timer
 * Calculate days/hours/minutes until a future date
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'countdown',
  aliases: ['until', 'daysuntil', 'countto'],
  category: 'free',
  description: 'Count down to a date. Usage: .countdown <YYYY-MM-DD> [event name]',
  usage: '.countdown 2025-12-25 Christmas | .countdown 2026-01-01',

  async execute({ args, reply }) {
    if (!args[0]) {
      return reply(
        '⏳ *Countdown*\n' +
        '━'.repeat(24) + '\n\n' +
        'Usage: *.countdown <YYYY-MM-DD> [event name]*\n\n' +
        'Examples:\n' +
        '  .countdown 2025-12-25 Christmas 🎄\n' +
        '  .countdown 2026-01-01 New Year 🎆\n' +
        '  .countdown 2026-06-15 My Birthday 🎂'
      );
    }

    const dateStr = args[0];
    const eventName = args.slice(1).join(' ') || 'Your Event';

    // Parse the date
    const target = new Date(dateStr + 'T00:00:00');
    if (isNaN(target.getTime())) {
      return reply(`❌ Invalid date: *${dateStr}*\n\nUse format: YYYY-MM-DD (e.g. 2025-12-25)`);
    }

    const now  = new Date();
    const diff = target - now;

    if (diff < 0) {
      const pastDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return reply(
        `📅 *${eventName}*\n` +
        '━'.repeat(28) + '\n\n' +
        `That date has already passed — *${pastDays} day${pastDays !== 1 ? 's' : ''} ago*.\n\n` +
        '_Time only moves one direction. Unfortunately._'
      );
    }

    if (diff === 0 || diff < 86400000) {
      return reply(`🎉 *${eventName}* is TODAY!\n\nGo celebrate. 🎊`);
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const weeks   = Math.floor(days / 7);
    const remDays = days % 7;

    const formatted = target.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const lines = [
      `⏳ *Countdown: ${eventName}*`,
      '━'.repeat(30),
      '',
      `📅 Date: *${formatted}*`,
      '',
      `🗓️ *${weeks} week${weeks !== 1 ? 's' : ''}*, ${remDays} day${remDays !== 1 ? 's' : ''}`,
      `   = ${days} days, ${hours}h ${minutes}m ${seconds}s`,
      '',
      '_Tick tock. ⏰_',
    ];
    await reply(lines.join('\n'));
  },
};
