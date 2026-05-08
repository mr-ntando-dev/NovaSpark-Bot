/**
 * ⚡ NovaSpark Bot — Daily Motivation
 * .motivate  — sends a powerful motivational message
 * By Dev-Ntando
 */
'use strict';

const QUOTES = [
  { q: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
  { q: 'Your limitation — it\'s only your imagination.', a: 'Unknown' },
  { q: 'Push yourself, because no one else is going to do it for you.', a: 'Unknown' },
  { q: 'Great things never come from comfort zones.', a: 'Unknown' },
  { q: 'Dream it. Wish it. Do it.', a: 'Unknown' },
  { q: 'Success doesn\'t just find you. You have to go out and get it.', a: 'Unknown' },
  { q: 'The harder you work for something, the greater you\'ll feel when you achieve it.', a: 'Unknown' },
  { q: 'Don\'t stop when you\'re tired. Stop when you\'re done.', a: 'Unknown' },
  { q: 'Wake up with determination. Go to bed with satisfaction.', a: 'Unknown' },
  { q: 'Do something today that your future self will thank you for.', a: 'Sean Patrick Flanery' },
  { q: 'Little things make big days.', a: 'Unknown' },
  { q: "It's going to be hard, but hard does not mean impossible.", a: 'Unknown' },
  { q: "Don't wait for opportunity. Create it.", a: 'Unknown' },
  { q: 'Sometimes we\'re tested not to show our weaknesses, but to discover our strengths.', a: 'Unknown' },
  { q: 'The key to success is to focus on goals, not obstacles.', a: 'Unknown' },
  { q: 'Dream bigger. Do bigger.', a: 'Unknown' },
  { q: 'You are capable of more than you know.', a: 'Unknown' },
  { q: 'Believe you can and you\'re halfway there.', a: 'Theodore Roosevelt' },
  { q: 'It always seems impossible until it\'s done.', a: 'Nelson Mandela' },
  { q: 'You don\'t have to be great to start, but you have to start to be great.', a: 'Zig Ziglar' },
  { q: 'Act as if what you do makes a difference. It does.', a: 'William James' },
  { q: 'Success is not how high you have climbed, but how you make a positive difference.', a: 'Roy T. Bennett' },
  { q: 'Believe in yourself and all that you are.', a: 'Christian D. Larson' },
  { q: 'Keep your eyes on the stars and your feet on the ground.', a: 'Theodore Roosevelt' },
  { q: 'Nothing is impossible. The word itself says "I\'m possible"!', a: 'Audrey Hepburn' },
];

const EMOJIS = ['🔥', '💪', '⚡', '🌟', '🚀', '💫', '🏆', '✨', '🎯', '💥'];

module.exports = {
  name: 'motivate',
  aliases: ['motivation', 'inspire', 'inspire2', 'boost'],
  category: 'inspire',
  description: 'Get a powerful motivational quote to start your day',
  usage: '.motivate',

  async execute({ reply }) {
    const q     = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const now   = new Date();
    const day   = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return reply(
      `${emoji} *Daily Motivation*\n` +
      `📅 ${day}\n\n` +
      `_"${q.q}"_\n\n` +
      `— *${q.a}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💬 Share this with someone who needs it today!\n` +
      `_⚡ NovaSpark Bot_`
    );
  },
};
