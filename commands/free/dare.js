/**
 * ⚡ NovaSpark Bot v5 — Dare
 * Random dare challenges for Truth or Dare games
 * By Dev-Ntando
 */
'use strict';

const DARES = [
  'Do your best impression of a celebrity for 30 seconds.',
  'Text the last person in your contacts "I have a confession to make..." and screenshot their reply.',
  'Do 15 push-ups right now. No excuses.',
  'Send a voice note singing the chorus of the last song you listened to.',
  'Change your profile photo to something embarrassing for 10 minutes.',
  'Write a 3-sentence love poem about the group and post it here.',
  'Call a random contact and say "Is your refrigerator running?"',
  'Do your best robot dance and describe it in detail.',
  'Type everything in ALL CAPS for the next 5 minutes.',
  'Let the group choose your next profile photo from options you suggest.',
  'Send a message to your crush that just says "hey 😳"',
  'Confess your most embarrassing moment right here, right now.',
  'Speak only in questions for the next 5 minutes in this chat.',
  'Send the most recent photo in your gallery (nothing private).',
  'Add a compliment to every message you send for the next 10 minutes.',
  'Do a 60-second timer: type as many words as you can think of starting with the letter S.',
  'Post your most-used emoji and explain why.',
  'Describe your current outfit in dramatic fashion-show commentary.',
  'Do an impression of the last person who texted you.',
  'Share the last YouTube video you watched.',
];

module.exports = {
  name: 'dare',
  aliases: ['challenge', 'tod-dare'],
  category: 'fun',
  description: 'Get a random dare challenge',
  usage: '.dare',

  async execute({ reply }) {
    const dare = DARES[Math.floor(Math.random() * DARES.length)];
    const lines = [
      '😈 *DARE!*',
      '━'.repeat(24),
      '',
      `🎯 _${dare}_`,
      '',
      'No backing out. 😂',
    ];
    await reply(lines.join('\n'));
  },
};
