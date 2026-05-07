/**
 * ⚡ NovaSpark Bot v5 — Magic 8-Ball
 * Ask the 8-ball anything
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';

const RESPONSES = [
  // Positive
  '✅ It is certain.',
  '✅ Without a doubt.',
  '✅ Yes, definitely!',
  '✅ You may rely on it.',
  '✅ As I see it, yes.',
  '✅ Most likely.',
  '✅ Outlook good.',
  '✅ Signs point to yes.',
  // Neutral
  '🔮 Reply hazy — try again.',
  '🔮 Ask again later.',
  '🔮 Better not tell you now.',
  '🔮 Cannot predict now.',
  '🔮 Concentrate and ask again.',
  // Negative
  '❌ Don\'t count on it.',
  '❌ My reply is no.',
  '❌ My sources say no.',
  '❌ Outlook not so good.',
  '❌ Very doubtful.',
  '❌ Absolutely not!',
];

module.exports = {
  name: '8ball',
  aliases: ['eightball', 'oracle', 'askball'],
  category: 'fun',
  description: 'Ask the Magic 8-Ball a yes/no question',
  usage: '.8ball <question>',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const question = args.join(' ');
    if (!question) return reply('❓ Ask me a yes/no question!\n\n_Example: .8ball Will I be rich?_');

    const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
    await reply(`🎱 *Magic 8-Ball*\n\n*Q:* ${question}\n\n${answer}`);
  },
};
