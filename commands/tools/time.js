/**
 * ⚡ NovaSpark v4 — World Clock
 * .time [city/timezone]
 * Shows time in 10 major cities or any specified timezone.
 * By Dev-Ntando
 */
'use strict';

const CITIES = {
  'Harare':        'Africa/Harare',
  'Johannesburg':  'Africa/Johannesburg',
  'Nairobi':       'Africa/Nairobi',
  'Lagos':         'Africa/Lagos',
  'Cairo':         'Africa/Cairo',
  'London':        'Europe/London',
  'New York':      'America/New_York',
  'Dubai':         'Asia/Dubai',
  'Mumbai':        'Asia/Kolkata',
  'Tokyo':         'Asia/Tokyo',
};

function cityTime(tz, city) {
  try {
    return new Date().toLocaleString('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
      weekday: 'short',
    });
  } catch { return '—'; }
}

module.exports = {
  name: 'time',
  aliases: ['localclock', 'timeclock'],
  description: '🕐 World clock — time in major cities or any timezone',
  category: 'tools',

  execute: async ({ args, reply }) => {
    if (args.length) {
      const tz = args.join(' ');
      try {
        const t = new Date().toLocaleString('en-GB', {
          timeZone: tz,
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        });
        return reply(`🕐 *${tz}*\n\n${t}`);
      } catch {
        return reply(`❌ Unknown timezone: \`${tz}\`\n\nExamples: \`Africa/Harare\`, \`Europe/London\`, \`Asia/Tokyo\``);
      }
    }

    const lines = Object.entries(CITIES)
      .map(([city, tz]) => `  🌍 *${city}:* ${cityTime(tz, city)}`)
      .join('\n');

    return reply(
      `🕐 *World Clock*\n` +
      `${'━'.repeat(28)}\n\n` +
      `${lines}\n\n` +
      `_Specific TZ: \`.time Africa/Harare\`_`
    );
  },
};
