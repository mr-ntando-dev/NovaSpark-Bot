/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .neverhaveiever — Random "Never Have I Ever" prompt
 * By Dev-Ntando
 */
'use strict';

const PROMPTS = [
  'Never have I ever stayed up past 3 AM for no reason.',
  'Never have I ever eaten an entire pizza alone.',
  'Never have I ever cried at a movie and denied it.',
  'Never have I ever texted someone and then immediately regretted it.',
  'Never have I ever lied about being "5 minutes away".',
  'Never have I ever ghosted someone I actually liked.',
  'Never have I ever pretended not to see a message.',
  'Never have I ever stalked an ex on social media.',
  'Never have I ever fallen asleep in class or a meeting.',
  'Never have I ever cancelled plans just to stay home and do nothing.',
  'Never have I ever sent a text to the wrong person.',
  'Never have I ever eaten food off the floor.',
  'Never have I ever laughed so hard I nearly cried.',
  'Never have I ever bought something I never used.',
  'Never have I ever told a white lie to avoid drama.',
  'Never have I ever pretended to know a song I have never heard.',
  'Never have I ever stayed in a toxic situation way too long.',
  'Never have I ever pulled an all-nighter before a deadline.',
  'Never have I ever forgotten someone\'s name immediately after hearing it.',
  'Never have I ever said "I\'m on my way" when still at home.',
];

module.exports = {
  name: 'neverhaveiever',
  aliases: ['nhie', 'neverever'],
  description: '🙋 Never Have I Ever — random prompt',
  category: 'fun',

  execute: async ({ reply }) => {
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    return reply(
      `🙋 *Never Have I Ever*\n${'━'.repeat(30)}\n\n` +
      `"${prompt}"\n\n` +
      `_React with 🙋 if you have, or 🙅 if not!_\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
