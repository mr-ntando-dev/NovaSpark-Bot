/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .catfact — Random cat fact
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'catfact',
  aliases: ['catfacts', 'meow'],
  description: 'Get a random cat fact',
  category: 'tools',

  execute: async ({ reply }) => {
    try {
      const { data } = await axios.get('https://catfact.ninja/fact', { timeout: 8000 });
      const fact = data?.fact || 'Cats sleep 12–16 hours a day.';
      return reply(`🐱 *Cat Fact*\n\n_${fact}_\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    } catch {
      return reply('❌ Could not fetch a cat fact right now. Try again later.');
    }
  },
};
