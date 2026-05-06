/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .age <YYYY-MM-DD> — Calculate exact age from date of birth
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'age',
  aliases: ['birthday', 'howold'],
  description: 'Calculate exact age from a date of birth',
  category: 'tools',
  usage: '.age <YYYY-MM-DD>',

  execute: async ({ args, reply }) => {
    const input = args[0];
    if (!input) return reply('📅 *Usage:* .age <YYYY-MM-DD>\nExample: .age 2000-05-15');

    const dob = new Date(input);
    if (isNaN(dob.getTime())) return reply('❌ Invalid date. Use format: *YYYY-MM-DD* e.g. 2000-05-15');

    const now = new Date();
    if (dob > now) return reply('❌ Date of birth cannot be in the future.');

    let years  = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth()    - dob.getMonth();
    let days   = now.getDate()     - dob.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
    const daysToNext = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));

    return reply(
      `🎂 *Age Calculator*\n` +
      `${'━'.repeat(28)}\n\n` +
      `📅 *DOB:* ${dob.toDateString()}\n` +
      `🎉 *Age:* ${years} years, ${months} months, ${days} days\n` +
      `⏳ *Next birthday in:* ${daysToNext} day${daysToNext === 1 ? '' : 's'}\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
