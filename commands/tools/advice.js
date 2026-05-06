/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .advice — Random life advice from advice.slip API
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'advice',
  aliases: ['tip', 'lifetip'],
  description: 'Get a random piece of life advice',
  category: 'tools',

  execute: async ({ reply }) => {
    try {
      const { data } = await axios.get('https://api.adviceslip.com/advice', {
        timeout: 8000,
        headers: { 'Cache-Control': 'no-cache' },
      });
      const slip = data?.slip?.advice || 'Always be kind.';
      return reply(`💡 *Advice of the Moment*\n\n_"${slip}"_\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    } catch {
      return reply('❌ Could not fetch advice right now. Try again later.');
    }
  },
};
