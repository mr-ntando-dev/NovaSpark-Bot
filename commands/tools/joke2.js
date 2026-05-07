/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .dadjoke — Random dad joke from icanhazdadjoke API
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'joke2dad',
  aliases: ['dad', 'joke2pun'],
  description: 'Get a random dad joke / pun',
  category: 'tools',

  execute: async ({ reply }) => {
    try {
      const { data } = await axios.get('https://icanhazdadjoke.com/', {
        timeout: 8000,
        headers: { Accept: 'application/json' },
      });
      const joke = data?.joke || 'Why do cows wear bells? Because their horns don\'t work!';
      return reply(`😂 *Dad Joke*\n\n_${joke}_\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    } catch {
      return reply('❌ Could not fetch a joke right now. Try again later.');
    }
  },
};
