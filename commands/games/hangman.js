/**
 * ⚡ NovaSpark v4 — Hangman
 * .hangman — Start game
 * .hangman <letter> — Guess a letter
 * By Dev-Ntando
 */
'use strict';
const WORDS = ['JAVASCRIPT','WHATSAPP','NOVASPARK','ELEPHANT','KEYBOARD','SUNSHINE',
               'ADVENTURE','BUTTERFLY','CHOCOLATE','FIREWORKS'];
const STAGES = [
  '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```',
];
const sessions = new Map();

module.exports = {
  name: 'hangman',
  aliases: ['hm'],
  description: '🪢 Hangman word game',
  category: 'games',

  execute: async ({ from, sender, args, reply }) => {
    const key  = `${from}:${sender}`;
    const input = (args[0] || '').toUpperCase().trim();

    if (!input) {
      const word   = WORDS[Math.floor(Math.random() * WORDS.length)];
      sessions.set(key, { word, guessed: [], wrong: 0 });
      const display = word.split('').map(() => '\\_').join(' ');
      return reply(`🪢 *Hangman Started!*\n\n${STAGES[0]}\n\n${display}\n\nGuess a letter: \`.hangman A\``);
    }

    if (!sessions.has(key)) return reply('❓ Start a game first with `.hangman`');
    const s = sessions.get(key);

    if (input.length !== 1 || !/[A-Z]/.test(input)) {
      return reply('❌ Guess one letter at a time. Example: `.hangman E`');
    }
    if (s.guessed.includes(input)) return reply(`🔁 Already guessed *${input}*.`);
    s.guessed.push(input);

    if (!s.word.includes(input)) {
      s.wrong++;
      if (s.wrong >= 6) {
        sessions.delete(key);
        return reply(`${STAGES[6]}\n\n💀 *Game over!* The word was: *${s.word}*\n_Play again: \`.hangman\`_`);
      }
    }

    const display = s.word.split('').map(c => (s.guessed.includes(c) ? c : '\\_')).join(' ');
    const won     = !display.includes('\\_');
    if (won) {
      sessions.delete(key);
      return reply(`🎉 *YOU WIN!* The word was *${s.word}*!\n_Play again: \`.hangman\`_`);
    }
    return reply(
      `${STAGES[s.wrong]}\n\n` +
      `*${display}*\n\n` +
      `❌ Wrong: ${s.guessed.filter(c => !s.word.includes(c)).join(' ') || '—'}\n` +
      `Lives left: ${'❤️'.repeat(6 - s.wrong)}${'🖤'.repeat(s.wrong)}`
    );
  },
};
