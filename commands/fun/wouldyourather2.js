/**
 * ⚡ NovaSpark v9 — Would You Rather (Interactive)
 * .wyr — Get a Would You Rather question with live voting
 * .wyr a or b — Cast your choice
 * .wyrresults — See current votes
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const QUESTIONS = [
  ['Have the ability to fly', 'Be invisible whenever you want'],
  ['Always speak the truth', 'Always lie'],
  ['Live in the city', 'Live in the countryside'],
  ['Have super strength', 'Have super speed'],
  ['Never use social media again', 'Never watch TV/movies again'],
  ['Be a famous singer', 'Be a famous athlete'],
  ['Have a pause button for your life', 'Have a rewind button for your life'],
  ['Be rich but ugly', 'Be poor but beautiful'],
  ['Know when you\'ll die', 'Know how you\'ll die'],
  ['Never be able to eat hot food', 'Never be able to eat cold food'],
  ['Have 10 amazing friends', 'Have 1 best friend forever'],
  ['Be famous but broke', 'Be unknown but wealthy'],
  ['Live 200 years as a regular person', 'Live 50 years as the most powerful person alive'],
  ['Have free WiFi wherever you go', 'Have free food wherever you go'],
  ['Only be able to whisper', 'Only be able to shout'],
  ['Fight 100 duck-sized horses', 'Fight 1 horse-sized duck'],
  ['Always be 10 minutes late', 'Always be 20 minutes early'],
  ['Give up your phone for a month', 'Give up TV for a year'],
  ['Know all the world\'s languages', 'Know how to play every instrument'],
  ['Live in a world without music', 'Live in a world without movies'],
  ['Be able to talk to animals', 'Be able to read minds'],
  ['Travel to the past', 'Travel to the future'],
  ['Never have to sleep', 'Never have to eat'],
  ['Be your own boss', 'Have an amazing boss'],
  ['Have more money', 'Have more time'],
];

const WYR_KEY = (gid) => `wyr_${gid}`;

module.exports = {
  name: 'wyr',
  aliases: ['wouldyourather2', 'either'],
  description: '🤔 Would You Rather — vote and see results!',
  category: 'fun',

  execute: async ({ from, sender, args, reply }) => {
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'a' || sub === 'b') {
      const game = database.getSetting ? database.getSetting(WYR_KEY(from)) : null;
      if (!game) return reply('🤔 No active WYR game. Start with *.wyr*');
      if (game.votes[sender] !== undefined) {
        return reply(`🤔 You already chose *${game.votes[sender] === 0 ? 'A' : 'B'}*. One vote per person!`);
      }
      game.votes[sender] = sub === 'a' ? 0 : 1;
      if (database.setSetting) database.setSetting(WYR_KEY(from), game);

      const totalA = Object.values(game.votes).filter(v => v === 0).length;
      const totalB = Object.values(game.votes).filter(v => v === 1).length;
      return reply(
        `✅ You chose *${sub.toUpperCase()}* — "${game.options[sub === 'a' ? 0 : 1]}"\n\n` +
        `Current: *A* ${totalA} vs ${totalB} *B*\n\n*.wyrresults* for full stats`
      );
    }

    if (sub === 'results' || sub === 'wyrresults') {
      const game = database.getSetting ? database.getSetting(WYR_KEY(from)) : null;
      if (!game) return reply('🤔 No active WYR game. Start with *.wyr*');
      const total = Object.keys(game.votes).length;
      const aVotes = Object.values(game.votes).filter(v => v === 0).length;
      const bVotes = total - aVotes;
      const aPct = total > 0 ? Math.round((aVotes / total) * 100) : 0;
      const bPct = 100 - aPct;
      const aBar = '█'.repeat(Math.round(aPct / 5)) + '░'.repeat(20 - Math.round(aPct / 5));
      const bBar = '█'.repeat(Math.round(bPct / 5)) + '░'.repeat(20 - Math.round(bPct / 5));
      return reply(
        `🤔 *WYR Results*\n\n` +
        `*A.* ${game.options[0]}\n[${aBar}] ${aPct}% (${aVotes})\n\n` +
        `*B.* ${game.options[1]}\n[${bBar}] ${bPct}% (${bVotes})\n\n` +
        `👥 Total votes: *${total}*`
      );
    }

    // New question
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    const game = { options: q, votes: {}, startedAt: Date.now() };
    if (database.setSetting) database.setSetting(WYR_KEY(from), game);

    return reply(
      `🤔 *Would You Rather...*\n\n` +
      `*A.* ${q[0]}\n\n` +
      `OR\n\n` +
      `*B.* ${q[1]}\n\n` +
      `Vote: *.wyr a* or *.wyr b*\n` +
      `Results: *.wyr results*`
    );
  },
};
