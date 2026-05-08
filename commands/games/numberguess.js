/**
 * ⚡ NovaSpark Bot — Number Guessing Game
 * .numguess [start|<number>]  — guess a number between 1-100
 * By Dev-Ntando
 */
'use strict';

const sessions = new Map();

module.exports = {
  name: 'numguess',
  aliases: ['numberguess', 'guessnumber', 'guess'],
  category: 'games',
  description: 'Guess a random number between 1 and 100 in 7 tries',
  usage: '.numguess start  |  .numguess <number>',

  async execute({ sock, msg, from, args, reply, sender, body }) {
    const key     = `${from}_${sender}`;
    const session = sessions.get(key);
    const input   = args.join(' ').toLowerCase().trim();

    if (!session || input === 'start') {
      const target   = Math.floor(Math.random() * 100) + 1;
      const maxTries = 7;
      sessions.set(key, { target, tries: 0, maxTries, guesses: [] });
      return reply(
        `🎯 *Number Guessing Game*\n\n` +
        `I'm thinking of a number between *1 and 100*.\n` +
        `You have *${maxTries} tries*. Good luck!\n\n` +
        `Send your first guess as a number: e.g. \`.numguess 50\``
      );
    }

    const guess = parseInt(input, 10);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      return reply('❓ Send a number between 1 and 100. Example: `.numguess 42`');
    }

    session.tries++;
    session.guesses.push(guess);
    const { target, tries, maxTries } = session;
    const triesLeft = maxTries - tries;
    const diff      = Math.abs(target - guess);

    if (guess === target) {
      sessions.delete(key);
      const ratings = ['🏆 Psychic!', '🥇 Amazing!', '🥈 Great!', '🥉 Good!', '👍 Not bad!', '😅 Just in time!', '😬 Barely!'];
      return reply(
        `🎉 *CORRECT! The number was ${target}!*\n\n` +
        `Tries: *${tries}/${maxTries}*  ${ratings[tries - 1] || '✅'}\n` +
        `Your guesses: ${session.guesses.join(' → ')}`
      );
    }

    if (triesLeft === 0) {
      sessions.delete(key);
      return reply(`💥 *Game Over!* The number was *${target}*.\nYour guesses: ${session.guesses.join(' → ')}\n\nTry again: \`.numguess start\``);
    }

    let hint;
    if (diff <= 3)       hint = '🔥 *Extremely hot!*';
    else if (diff <= 8)  hint = '♨️ *Very warm!*';
    else if (diff <= 15) hint = '😊 *Warm*';
    else if (diff <= 25) hint = '😐 *Cool*';
    else if (diff <= 40) hint = '🥶 *Cold*';
    else                 hint = '🧊 *Freezing cold!*';

    const direction = guess < target ? '⬆️ Go higher' : '⬇️ Go lower';
    return reply(
      `${guess < target ? '⬆️' : '⬇️'} *${guess}* is too ${guess < target ? 'low' : 'high'}!\n\n` +
      `${hint}  ·  ${direction}\n` +
      `Tries left: *${triesLeft}/${maxTries}*\n` +
      `Guesses so far: ${session.guesses.join(' → ')}`
    );
  },
};
