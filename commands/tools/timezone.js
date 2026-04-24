/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .timezone / .tz — World clock / timezone converter
 * By Dev-Ntando
 */
'use strict';

const ZONES = {
  'harare':       'Africa/Harare',
  'johannesburg': 'Africa/Johannesburg',
  'joburg':       'Africa/Johannesburg',
  'sa':           'Africa/Johannesburg',
  'zim':          'Africa/Harare',
  'nairobi':      'Africa/Nairobi',
  'lagos':        'Africa/Lagos',
  'cairo':        'Africa/Cairo',
  'london':       'Europe/London',
  'uk':           'Europe/London',
  'paris':        'Europe/Paris',
  'berlin':       'Europe/Berlin',
  'moscow':       'Europe/Moscow',
  'dubai':        'Asia/Dubai',
  'india':        'Asia/Kolkata',
  'mumbai':       'Asia/Kolkata',
  'delhi':        'Asia/Kolkata',
  'ist':          'Asia/Kolkata',
  'china':        'Asia/Shanghai',
  'beijing':      'Asia/Shanghai',
  'tokyo':        'Asia/Tokyo',
  'japan':        'Asia/Tokyo',
  'sydney':       'Australia/Sydney',
  'australia':    'Australia/Sydney',
  'newyork':      'America/New_York',
  'nyc':          'America/New_York',
  'est':          'America/New_York',
  'chicago':      'America/Chicago',
  'denver':       'America/Denver',
  'losangeles':   'America/Los_Angeles',
  'la':           'America/Los_Angeles',
  'pst':          'America/Los_Angeles',
  'toronto':      'America/Toronto',
  'canada':       'America/Toronto',
  'saopaulo':     'America/Sao_Paulo',
  'brazil':       'America/Sao_Paulo',
  'utc':          'UTC',
  'gmt':          'UTC',
};

const WORLD_CITIES = [
  { name: '🇿🇼 Harare',        tz: 'Africa/Harare' },
  { name: '🇿🇦 Johannesburg',  tz: 'Africa/Johannesburg' },
  { name: '🇳🇬 Lagos',         tz: 'Africa/Lagos' },
  { name: '🇬🇧 London',        tz: 'Europe/London' },
  { name: '🇦🇪 Dubai',         tz: 'Asia/Dubai' },
  { name: '🇮🇳 Mumbai',        tz: 'Asia/Kolkata' },
  { name: '🇯🇵 Tokyo',         tz: 'Asia/Tokyo' },
  { name: '🇺🇸 New York',      tz: 'America/New_York' },
  { name: '🇺🇸 Los Angeles',   tz: 'America/Los_Angeles' },
  { name: '🇦🇺 Sydney',        tz: 'Australia/Sydney' },
];

function formatTime(tz) {
  try {
    return new Date().toLocaleString('en-US', {
      timeZone: tz,
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid timezone';
  }
}

module.exports = {
  name: 'timezone',
  aliases: ['tz', 'worldclock', 'clock'],
  description: '🌍 World clock — check current time in any city/timezone',
  category: 'tools',
  usage: '.timezone [city/code]  — or just .timezone for world clock',

  execute: async ({ args, reply }) => {
    // No args — show world clock
    if (!args.length) {
      const lines = WORLD_CITIES.map(c => `${c.name.padEnd(20)} ${formatTime(c.tz)}`);
      return reply(
        `🌍 *World Clock*\n${'━'.repeat(30)}\n\n` +
        lines.join('\n') +
        `\n\n_Use .tz <city> for a specific location_\n_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    const query = args.join('').toLowerCase().replace(/\s+/g, '');
    const tz    = ZONES[query] || args.join(' ');

    let timeStr;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
      timeStr = formatTime(tz);
    } catch {
      return reply(
        `❌ Unknown timezone/city: *${args.join(' ')}*\n\n` +
        `*Try:* harare, london, dubai, tokyo, newyork, sydney, etc.\n` +
        `Or use a full IANA timezone like: \`America/New_York\`\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    return reply(
      `🕐 *Timezone Lookup*\n${'━'.repeat(28)}\n\n` +
      `📍 *Location:* ${args.join(' ')}\n` +
      `🌐 *Zone:* ${tz}\n` +
      `⏰ *Current Time:* ${timeStr}\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
