/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .numfact [number] — Fun fact about a number (random if omitted)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'numfact',
  aliases: ['numberfact', 'numtrivia'],
  description: 'Get a fun fact about a number',
  category: 'tools',
  usage: '.numfact [number]',

  execute: async ({ args, reply }) => {
    const num = args[0] && /^\d+$/.test(args[0]) ? args[0] : 'random';
    try {
      const { data } = await axios.get(`http://numbersapi.com/${num}/trivia`, {
        timeout: 8000,
        responseType: 'text',
      });
      return reply(`🔢 *Number Fact*\n\n_${data}_\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    } catch {
      return reply('❌ Could not fetch a number fact right now. Try again later.');
    }
  },
};
