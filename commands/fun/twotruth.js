/**
 * ⚡ NovaSpark Bot — Two Truths & A Lie
 * .2truth — presents 3 statements, one is a lie. Reply with the lie number.
 * By Dev-Ntando
 */
'use strict';

const GAMES = [
  { statements: ['I can survive without a head for hours (cockroach).', 'Honey never spoils — archaeologists found 3000-year-old honey.', 'Sharks are mammals.'], lie: 3 },
  { statements: ['Cleopatra lived closer in time to the Moon landing than to the pyramids being built.', 'A day on Venus is longer than a year on Venus.', 'Water boils faster at high altitude.'], lie: 3 },
  { statements: ['Bananas are technically berries.', 'Strawberries are not true berries.', 'A tomato is a vegetable.'], lie: 3 },
  { statements: ['Octopuses have three hearts.', 'A group of flamingos is called a flamboyance.', 'Elephants are the only animals that can\'t jump.'], lie: 3 },
  { statements: ['The Great Wall of China is visible from space.', 'Oxford University is older than the Aztec Empire.', 'Lightning strikes the same place twice (often).'], lie: 1 },
  { statements: ['Humans share 60% DNA with bananas.', 'The average person walks about 100,000 miles in a lifetime.', 'Goldfish have a 3-second memory.'], lie: 3 },
  { statements: ['It rains diamonds on Neptune.', 'A snail can sleep for 3 years.', 'Bulls are enraged by the colour red.'], lie: 3 },
  { statements: ['Penguins propose with pebbles.', 'A group of owls is called a parliament.', 'Cats can\'t taste sweetness, but dogs can\'t either.'], lie: 3 },
];

// Track active sessions: from → { lie, answered }
const _sessions = new Map();

module.exports = {
  name: '2truth',
  aliases: ['twotruths', '2t', 'twotruth'],
  category: 'fun',
  description: 'Two Truths and a Lie — guess which statement is false',
  usage: '.2truth | .2truth <1/2/3> to answer',

  async execute({ from, args, reply }) {
    const sub = args[0];

    // Answer
    if (sub && /^[123]$/.test(sub)) {
      const session = _sessions.get(from);
      if (!session) return reply('❓ No active game! Start one with *.2truth*');
      _sessions.delete(from);
      const guess = parseInt(sub);
      if (guess === session.lie) {
        return reply(`🎉 *Correct!* Statement #${session.lie} was the lie!\n\n_${session.statements[session.lie - 1]}_\n\nStart a new round: *.2truth*`);
      }
      return reply(`❌ *Wrong!* The lie was #${session.lie}:\n\n_${session.statements[session.lie - 1]}_\n\nTry again: *.2truth*`);
    }

    // New game
    const game = GAMES[Math.floor(Math.random() * GAMES.length)];
    _sessions.set(from, game);

    const lines = game.statements.map((s, i) => `*${i + 1}.* ${s}`).join('\n');
    return reply(
      `🤥 *Two Truths & A Lie*\n\n` +
      `Two of these are true. One is a lie. Which one?\n\n` +
      `${lines}\n\n` +
      `Reply *.2truth 1*, *.2truth 2*, or *.2truth 3* to guess!`
    );
  },
};
