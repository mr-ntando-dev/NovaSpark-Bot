/**
 * ⚡ NovaSpark v4 — Rock Paper Scissors (with score tracking)
 * .rps rock/paper/scissors
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const CHOICES = ['rock','paper','scissors'];
const EMOJI   = { rock:'🪨', paper:'📄', scissors:'✂️' };
const BEATS   = { rock:'scissors', paper:'rock', scissors:'paper' };

module.exports = {
  name: 'rps',
  aliases: ['rockpaperscissors'],
  description: '🪨 Rock Paper Scissors with win/loss tracking',
  category: 'games',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const choice = (args[0] || '').toLowerCase();
    if (!CHOICES.includes(choice)) {
      return reply(
        '🪨 *Rock Paper Scissors*\n\n' +
        'Usage:\n  `.rps rock`\n  `.rps paper`\n  `.rps scissors`'
      );
    }
    const bot    = CHOICES[Math.floor(Math.random() * 3)];
    const won    = BEATS[choice] === bot;
    const tied   = choice === bot;
    const result = tied ? 'tie' : won ? 'win' : 'loss';

    const profile = database.getUserProfile ? database.getUserProfile(sender) : {};
    const rpsStats = profile.rps || { wins: 0, losses: 0, ties: 0 };
    rpsStats[result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'ties']++;
    if (database.updateUserProfile) database.updateUserProfile(sender, { rps: rpsStats });

    const total = rpsStats.wins + rpsStats.losses + rpsStats.ties;
    return reply(
      `${EMOJI[choice]} vs ${EMOJI[bot]}\n\n` +
      `You: *${choice}* | Me: *${bot}*\n\n` +
      (tied ? `🤝 *Tie!* We both picked ${choice}.`
             : won ? `🎉 *You win!* ${choice} beats ${bot}!`
                   : `😈 *I win!* ${bot} beats ${choice}!`) +
      `\n\n📊 Record: ${rpsStats.wins}W ${rpsStats.losses}L ${rpsStats.ties}T (${total} games)`
    );
  },
};
