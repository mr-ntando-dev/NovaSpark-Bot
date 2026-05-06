/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .dogfact — Random dog fact
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'dogfact',
  aliases: ['dogfacts', 'woof'],
  description: 'Get a random dog fact',
  category: 'tools',

  execute: async ({ reply }) => {
    try {
      const { data } = await axios.get('https://dogapi.dog/api/v2/facts?limit=1', { timeout: 8000 });
      const fact = data?.data?.[0]?.attributes?.body || 'Dogs have a sense of time and miss their owners when apart.';
      return reply(`🐶 *Dog Fact*\n\n_${fact}_\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    } catch {
      return reply('❌ Could not fetch a dog fact right now. Try again later.');
    }
  },
};
