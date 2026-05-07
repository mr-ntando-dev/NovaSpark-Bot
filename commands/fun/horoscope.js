/**
 * ⚡ NovaSpark Bot v5 — Horoscope
 * Daily horoscope for any zodiac sign
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const SIGNS = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces',
];

const EMOJIS = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

// Local fallback readings (rotated daily so they feel fresh)
const FALLBACK = {
  aries:       ['Bold moves bring big rewards today. Trust your instincts, but look before you leap.',
                'Your energy is magnetic — use it to lead, not to steamroll.',
                'Patience isn\'t your strong suit, but today it will pay off.'],
  taurus:      ['Stability you\'ve built is about to pay dividends. Hold steady.',
                'Resist the urge to splurge — a smarter opportunity is coming.',
                'Comfort is earned, not given. Keep building.'],
  gemini:      ['Two ideas competing in your head? Pick one and commit today.',
                'Your words carry more power than you realise — use them wisely.',
                'Social connections open unexpected doors this week.'],
  cancer:      ['Your intuition is sharper than any logic today. Trust it.',
                'Someone close needs your support — check in on them.',
                'Home and family energy is strong. Nurture it.'],
  leo:         ['The spotlight is yours. Step into it without apology.',
                'Generosity comes back to you tenfold — give freely.',
                'Creative energy peaks today. Express yourself.'],
  virgo:       ['Detail-oriented thinking solves the problem everyone else missed.',
                'Stop perfecting and start shipping. Done beats perfect.',
                'Your analytical mind is an asset — others are watching.'],
  libra:       ['Balance is not stillness — it\'s constant adjustment. Adjust today.',
                'A compromise you offer today will be remembered long-term.',
                'Beauty and harmony are within reach if you reach for them.'],
  scorpio:     ['Depth is your superpower. Dive into what others avoid.',
                'Secrets come to light — be the one who handles it with grace.',
                'Transformation is uncomfortable but necessary.'],
  sagittarius: ['Adventure calls — even a small change of scenery shifts your perspective.',
                'Your optimism is contagious today. Share it.',
                'Truth-telling comes naturally to you; so does tact — use both.'],
  capricorn:   ['Discipline today compounds into freedom tomorrow. Stay the course.',
                'Leadership is demanded of you — step up.',
                'Long-term thinking is your edge. Play the long game.'],
  aquarius:    ['Innovation you\'ve been sitting on is ready to launch. Go.',
                'Community matters — you can\'t build the future alone.',
                'Your unconventional approach is exactly what\'s needed.'],
  pisces:      ['Creativity and empathy are gifts — deploy them intentionally today.',
                'Boundaries protect your energy. Set one.',
                'Dreams are data. Pay attention to them.'],
};

function getDayIndex() {
  const now = new Date();
  return now.getDate() % 3; // 0, 1, or 2 — rotates every day
}

module.exports = {
  name: 'horoscope',
  aliases: ['horo', 'horozodiac', 'horostar'],
  category: 'fun',
  description: 'Get your daily horoscope. Usage: .horoscope <sign>',
  usage: '.horoscope leo | .horoscope virgo',

  async execute({ args, reply }) {
    if (!args[0]) {
      const list = SIGNS.map(s => `${EMOJIS[s]} ${s}`).join('  |  ');
      return reply(
        `🔮 *Daily Horoscope*\n${'━'.repeat(28)}\n\n` +
        `Usage: *.horoscope <sign>*\n\nSigns:\n${list}`
      );
    }

    const sign = args[0].toLowerCase();
    if (!SIGNS.includes(sign)) {
      return reply(`❌ Unknown sign: *${args[0]}*\n\nValid signs: ${SIGNS.join(', ')}`);
    }

    const emoji = EMOJIS[sign];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
      // Aztro-like free API
      const { data } = await axios.post(
        `https://aztro.sameerkumar.website/?sign=${sign}&day=today`,
        null,
        { timeout: 6000 }
      );
      const lines = [
        `${emoji} *${sign.charAt(0).toUpperCase() + sign.slice(1)} — Daily Horoscope*`,
        '━'.repeat(32),
        `📅 ${today}`,
        '',
        `📖 ${data.description}`,
        '',
        `🌈 *Mood:* ${data.mood}`,
        `🎨 *Color:* ${data.color}`,
        `🔢 *Lucky Number:* ${data.lucky_number}`,
        `⏰ *Lucky Time:* ${data.lucky_time}`,
        `♥️ *Compatibility:* ${data.compatibility}`,
        '',
        '_The stars speak. Whether you listen is on you. ⭐_',
      ];
      return reply(lines.join('\n'));
    } catch {
      // Fallback
      const fb = FALLBACK[sign][getDayIndex()];
      const lines = [
        `${emoji} *${sign.charAt(0).toUpperCase() + sign.slice(1)} — Daily Horoscope*`,
        '━'.repeat(32),
        `📅 ${today}`,
        '',
        `📖 ${fb}`,
        '',
        '_The stars speak. Whether you listen is on you. ⭐_',
      ];
      return reply(lines.join('\n'));
    }
  },
};
