/**
 * ⚡ NovaSpark v4 — Wordle in WhatsApp
 * .wordle — Start a Wordle game
 * .wordle <guess> — Make a guess
 * NEVER SEEN in any WhatsApp MD bot before.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const WORDS = [
  'BRAVE','FLAME','GHOST','PRIZE','CANDY','BLAZE','CRISP','DRIFT','FLAIR','GLOOM',
  'PLUCK','QUIRK','SHINY','TWIRL','VODKA','WATER','XENON','YACHT','ZESTY','ABODE',
  'CHESS','DRIVE','EAGER','FJORD','GROAN','HEDGE','IRONY','JOUST','KNEEL','LIGHT',
  'MAGIC','NURSE','OZONE','PEACE','QUEEN','REACH','STORM','TOUCH','UNITY','VIVID',
  'WALTZ','EXTRA','YOUTH','ZEBRA','AMAZE','BASIN','CHOIR','DEPOT','EMOTE','FRONT',
];

function pick() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }

function evaluate(guess, answer) {
  const result = [];
  const used   = Array(5).fill(false);
  const ansArr = answer.split('');
  // Green pass
  for (let i = 0; i < 5; i++) {
    if (guess[i] === ansArr[i]) { result[i] = '🟩'; used[i] = true; }
    else result[i] = null;
  }
  // Yellow / grey pass
  for (let i = 0; i < 5; i++) {
    if (result[i]) continue;
    const yi = ansArr.findIndex((c, j) => !used[j] && c === guess[i]);
    if (yi !== -1) { result[i] = '🟨'; used[yi] = true; }
    else result[i] = '⬛';
  }
  return result.join('');
}

function board(guesses, answer) {
  return guesses.map((g, i) => `${i + 1}. ${evaluate(g, answer)} *${g}*`).join('\n');
}

// In-memory sessions: chatId+userId → { answer, guesses }
const sessions = new Map();

module.exports = {
  name: 'wordle',
  aliases: ['wrd'],
  description: '🟩 Play Wordle in WhatsApp — guess the 5-letter word!',
  category: 'games',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const key   = `${from}:${sender}`;
    const guess = (args[0] || '').toUpperCase().trim();

    // No arg → start new game or show status
    if (!guess) {
      if (sessions.has(key)) {
        const s = sessions.get(key);
        return reply(
          `🟩 *Your Wordle Game*\n\n` +
          `${board(s.guesses, s.answer)}\n\n` +
          `Attempts: *${s.guesses.length}/6*\n` +
          `Guess with: \`.wordle WORD\``
        );
      }
      sessions.set(key, { answer: pick(), guesses: [] });
      return reply(
        `🟩 *Wordle Started!*\n\n` +
        `I've picked a *5-letter word*.\n` +
        `You have *6 attempts*.\n\n` +
        `🟩 = correct spot\n` +
        `🟨 = wrong spot\n` +
        `⬛ = not in word\n\n` +
        `Guess with: \`.wordle APPLE\``
      );
    }

    if (!sessions.has(key)) {
      return reply('❓ No active game. Start with `.wordle`');
    }

    if (!/^[A-Z]{5}$/.test(guess)) {
      return reply('❌ Must be exactly 5 letters. Example: `.wordle BRAVE`');
    }

    const s = sessions.get(key);
    s.guesses.push(guess);

    const won  = guess === s.answer;
    const over = s.guesses.length >= 6;

    if (won) {
      sessions.delete(key);
      return reply(
        `🎉 *You got it in ${s.guesses.length}!*\n\n` +
        `${board(s.guesses, s.answer)}\n\n` +
        `The word was: *${s.answer}*\n` +
        `_Play again: \`.wordle\`_`
      );
    }

    if (over) {
      sessions.delete(key);
      return reply(
        `😢 *Game over!*\n\n` +
        `${board(s.guesses, s.answer)}\n\n` +
        `The word was: *${s.answer}*\n` +
        `_Try again: \`.wordle\`_`
      );
    }

    return reply(
      `🟩 *Wordle*\n\n` +
      `${board(s.guesses, s.answer)}\n\n` +
      `Attempts: *${s.guesses.length}/6* — Keep going!`
    );
  },
};
