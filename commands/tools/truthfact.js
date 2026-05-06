/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .truthfact — Random mind-blowing true fact fetched live
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const FALLBACK = [
  'Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.',
  'A group of flamingos is called a "flamboyance".',
  'Wombat poop is cube-shaped — the only animal with this trait.',
  'The human eye can distinguish approximately 10 million different colors.',
  'Sharks are older than trees. Sharks have existed for about 450 million years, while trees appeared about 350 million years ago.',
  'A single bolt of lightning contains enough energy to toast 100,000 slices of bread.',
  'Octopuses have three hearts, blue blood, and can taste with their suckers.',
  'There are more possible iterations of a game of chess than there are atoms in the known universe.',
  'The Eiffel Tower can be 15 cm taller during summer due to thermal expansion.',
  'Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.',
];

module.exports = {
  name: 'truthfact',
  aliases: ['mindblown', 'didyouknow', 'dyk'],
  description: '🤯 Random mind-blowing true fact',
  category: 'tools',

  execute: async ({ reply }) => {
    let fact;
    try {
      const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 6000 });
      fact = res.data?.text || FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    } catch {
      fact = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    }

    return reply(
      `🤯 *Mind-Blowing Fact*\n${'━'.repeat(30)}\n\n` +
      `"${fact}"\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
