/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .zodiac <sign> — Get today's zodiac reading
 * By Dev-Ntando
 */
'use strict';

const READINGS = {
  aries:       { emoji: '♈', dates: 'Mar 21 – Apr 19', element: 'Fire 🔥',   trait: 'Bold & Ambitious',    today: 'Energy is high. Trust your gut and make the first move.' },
  taurus:      { emoji: '♉', dates: 'Apr 20 – May 20', element: 'Earth 🌍',  trait: 'Patient & Reliable',  today: 'A slow, steady day. Good for planning and financial decisions.' },
  gemini:      { emoji: '♊', dates: 'May 21 – Jun 20', element: 'Air 💨',    trait: 'Curious & Adaptable', today: 'Your mind is sharp. A conversation opens new doors today.' },
  cancer:      { emoji: '♋', dates: 'Jun 21 – Jul 22', element: 'Water 💧',  trait: 'Intuitive & Caring',  today: 'Protect your peace. Home and family bring comfort today.' },
  leo:         { emoji: '♌', dates: 'Jul 23 – Aug 22', element: 'Fire 🔥',   trait: 'Charismatic & Brave', today: 'All eyes on you. Step into the spotlight — you belong there.' },
  virgo:       { emoji: '♍', dates: 'Aug 23 – Sep 22', element: 'Earth 🌍',  trait: 'Analytical & Kind',   today: 'Details matter today. Your precision solves a long-standing problem.' },
  libra:       { emoji: '♎', dates: 'Sep 23 – Oct 22', element: 'Air 💨',    trait: 'Diplomatic & Fair',   today: 'Balance is your superpower. A compromise leads to harmony.' },
  scorpio:     { emoji: '♏', dates: 'Oct 23 – Nov 21', element: 'Water 💧',  trait: 'Intense & Focused',   today: 'Depth over surface. Seek truth and you will find it.' },
  sagittarius: { emoji: '♐', dates: 'Nov 22 – Dec 21', element: 'Fire 🔥',   trait: 'Adventurous & Free',  today: 'Explore something new. An unexpected adventure awaits.' },
  capricorn:   { emoji: '♑', dates: 'Dec 22 – Jan 19', element: 'Earth 🌍',  trait: 'Disciplined & Wise',  today: 'Hard work pays off. Stay focused and success follows.' },
  aquarius:    { emoji: '♒', dates: 'Jan 20 – Feb 18', element: 'Air 💨',    trait: 'Innovative & Free',   today: 'Think outside the box. Your weird idea is the right one.' },
  pisces:      { emoji: '♓', dates: 'Feb 19 – Mar 20', element: 'Water 💧',  trait: 'Dreamy & Compassionate', today: 'Trust your feelings. A dream from last night carries a message.' },
};

module.exports = {
  name: 'zodiac',
  aliases: ['star', 'starsign', 'astro'],
  description: '🔮 Get your zodiac reading for today',
  category: 'fun',

  execute: async ({ args, reply }) => {
    const sign = (args[0] || '').toLowerCase();
    const r    = READINGS[sign];
    if (!r) {
      return reply(
        `🔮 *Zodiac Signs*\n${'━'.repeat(28)}\n\n` +
        Object.entries(READINGS).map(([s, v]) => `${v.emoji} ${s}`).join(' · ') +
        `\n\nUsage: \`.zodiac aries\``
      );
    }
    return reply(
      `${r.emoji} *${sign.charAt(0).toUpperCase() + sign.slice(1)} — Today's Reading*\n${'━'.repeat(28)}\n\n` +
      `📅 Dates: _${r.dates}_\n` +
      `🌀 Element: ${r.element}\n` +
      `✨ Trait: _${r.trait}_\n\n` +
      `🔮 *Today:* ${r.today}\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
