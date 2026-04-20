/**
 * ⚡ NovaSpark Bot v5 — Quote
 * Fetch an inspirational / random quote
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const FALLBACK = [
  { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
  { q: 'In the middle of every difficulty lies opportunity.', a: 'Albert Einstein' },
  { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
  { q: 'Life is what happens when you are busy making other plans.', a: 'John Lennon' },
  { q: 'The future belongs to those who believe in the beauty of their dreams.', a: 'Eleanor Roosevelt' },
  { q: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', a: 'Winston Churchill' },
  { q: 'Believe you can and you are halfway there.', a: 'Theodore Roosevelt' },
  { q: 'Hard work beats talent when talent does not work hard.', a: 'Tim Notke' },
];

module.exports = {
  name: 'quote',
  aliases: ['quotes', 'inspire', 'motivation'],
  category: 'fun',
  description: 'Get a random inspirational quote',
  usage: '.quote',

  async execute(sock, msg, args, extra) {
    try {
      const { data } = await axios.get('https://api.quotable.io/random', { timeout: 8000 });
      await extra.reply(`💬 *"${data.content}"*\n\n— _${data.author}_`);
    } catch {
      const fb = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
      await extra.reply(`💬 *"${fb.q}"*\n\n— _${fb.a}_`);
    }
  },
};
