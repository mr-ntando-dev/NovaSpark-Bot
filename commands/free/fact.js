/**
 * NovaSpark Bot v3 — Random Fact
 * .fact — fetches a verified, interesting fact from a live API
 * Uses uselessfacts.jsph.pl (free, no key, always online)
 * By Dev-Ntando
 */
'use strict';

const axios    = require('axios');
const APIs     = require('../../utils/api');
const database = require('../../database');

const FACT_ENDPOINTS = [
  // Useless Facts API — wildly reliable
  async () => {
    const { data } = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 8000 });
    return data.text;
  },
  // Fallback: Numbers API (math/trivia mix)
  async () => {
    const { data } = await axios.get('http://numbersapi.com/random/trivia?json', { timeout: 8000 });
    return data.text;
  },
  // Fallback: AI-generated fact
  async () => {
    return await APIs.chatAI(
      'Give me one amazing, verified, surprising fact about the world. Just the fact — no intro, no source citation.',
      'You are a trivia master. Give one fascinating, 100% true fact. Keep it to 1-2 sentences.'
    );
  },
];

module.exports = {
  name: 'fact',
  aliases: ['funfact', 'trivia', 'didyouknow'],
  description: 'Get a random verified interesting fact',
  category: 'free',

  execute: async ({ sock, from, sender, reply }) => {
    database.logCommand(sender, 'fact');
    await sock.sendPresenceUpdate('composing', from);

    let factText = null;
    for (const endpoint of FACT_ENDPOINTS) {
      try {
        factText = await endpoint();
        if (factText) break;
      } catch (_) { /* try next */ }
    }

    if (!factText) return reply('❌ Could not fetch a fact right now. Try again!');

    // Capitalize first letter
    factText = factText.charAt(0).toUpperCase() + factText.slice(1);
    if (!factText.endsWith('.') && !factText.endsWith('!') && !factText.endsWith('?')) {
      factText += '.';
    }

    await reply(`🧠 *Did You Know?*\n\n${factText}\n\n_Nova AI ⚡_`);
  },
};
