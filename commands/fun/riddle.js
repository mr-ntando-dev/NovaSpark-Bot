/**
 * ⚡ NovaSpark Bot v5 — Riddle
 * Ask a riddle — answer revealed with .riddle answer
 * By Dev-Ntando
 */
'use strict';

const RIDDLES = [
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "An echo" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps" },
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow. I have water, but no fish swim. I have roads, but no cars drive. What am I?", a: "A map" },
  { q: "What has hands but cannot clap?", a: "A clock" },
  { q: "What gets wetter as it dries?", a: "A towel" },
  { q: "I'm light as a feather, yet the strongest person can't hold me for more than a few minutes. What am I?", a: "Breath" },
  { q: "What can travel around the world while staying in a corner?", a: "A stamp" },
  { q: "The more you have of it, the less you see. What is it?", a: "Darkness" },
  { q: "What has a head and a tail but no body?", a: "A coin" },
  { q: "I'm always in front of you but can't be seen. What am I?", a: "The future" },
  { q: "What has keys but no locks, space but no room, and you can enter but can't go inside?", a: "A keyboard" },
  { q: "What breaks but never falls, and falls but never breaks?", a: "Day and night" },
  { q: "I have teeth but cannot bite. What am I?", a: "A comb" },
  { q: "What can you catch but not throw?", a: "A cold" },
  { q: "The more you remove from me, the bigger I get. What am I?", a: "A hole" },
];

// Active riddle sessions: jid → riddle index
const sessions = new Map();

module.exports = {
  name: 'riddle',
  aliases: ['brainteaser', 'puzzle'],
  category: 'fun',
  description: 'Get a riddle. Use .riddle answer to reveal the answer.',
  usage: '.riddle | .riddle answer',

  async execute({ from, args, reply }) {
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'answer' || sub === 'ans' || sub === 'reveal') {
      const idx = sessions.get(from);
      if (idx === undefined) {
        return reply('🤔 No active riddle. Send *.riddle* to get one first!');
      }
      sessions.delete(from);
      const r = RIDDLES[idx];
      return reply(`💡 *Answer:*\n\n${r.a}\n\n_Did you get it right? 🎉_`);
    }

    const idx = Math.floor(Math.random() * RIDDLES.length);
    sessions.set(from, idx);
    const r = RIDDLES[idx];

    const lines = [
      '🧩 *Riddle Time!*',
      '━'.repeat(28),
      '',
      `❓ _${r.q}_`,
      '',
      'Think you know? Reply with *.riddle answer* to reveal!',
    ];
    await reply(lines.join('\n'));
  },
};
