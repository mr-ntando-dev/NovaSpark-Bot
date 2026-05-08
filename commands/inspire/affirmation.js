/**
 * ⚡ NovaSpark Bot — Daily Affirmation
 * .affirm  — sends a positive affirmation message
 * By Dev-Ntando
 */
'use strict';

const AFFIRMATIONS = [
  'I am capable of achieving anything I set my mind to.',
  'I choose to be confident and believe in myself today.',
  'Every day I am growing stronger, wiser, and more resilient.',
  'I deserve success, love, and happiness.',
  'My potential is unlimited and my future is bright.',
  'I am a magnet for positive energy and wonderful opportunities.',
  'I trust the process and I know good things are coming my way.',
  'I release all negative thoughts and embrace positivity today.',
  'I am brave enough to create the life I truly desire.',
  'My past does not define me — I am building a better future.',
  'I am grateful for everything I have and excited for what\'s to come.',
  'I radiate confidence, joy, and love wherever I go.',
  'I am enough, exactly as I am right now.',
  'Challenges only make me stronger and more capable.',
  'I attract people who uplift and inspire me.',
  'I am in charge of my own happiness and I choose joy.',
  'Every step forward — no matter how small — is progress.',
  'I believe in my ability to overcome any obstacle I face.',
  'I am worthy of all the good that life has to offer.',
  'Today I will be the best version of myself.',
];

const INTROS = [
  "Here's your affirmation for today 🌟",
  "Read this, believe it, own it 💫",
  "Say this out loud and mean it ⚡",
  "Your daily power statement 🔥",
  "Repeat after me 🙏",
];

module.exports = {
  name: 'affirm',
  aliases: ['affirmation', 'affirmations', 'dailyaffirm'],
  category: 'inspire',
  description: 'Get a positive daily affirmation',
  usage: '.affirm',

  async execute({ reply }) {
    const aff   = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    const intro = INTROS[Math.floor(Math.random() * INTROS.length)];
    const now   = new Date();
    const day   = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return reply(
      `🌸 *Daily Affirmation*\n` +
      `📅 ${day}\n\n` +
      `${intro}:\n\n` +
      `✨ _"${aff}"_\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💙 You are stronger than you think!\n` +
      `_⚡ NovaSpark Bot_`
    );
  },
};
