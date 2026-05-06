/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .wod — Word of the Day
 * By Dev-Ntando
 */
'use strict';

const WORDS = [
  {
    word: 'Ephemeral', pronunciation: '/ɪˈfem.ər.əl/',
    type: 'adjective',
    definition: 'Lasting for only a short time; transitory.',
    example: 'The ephemeral beauty of cherry blossoms makes them all the more precious.',
    origin: 'Greek: ephemeros — lasting a day',
  },
  {
    word: 'Sonder', pronunciation: '/ˈsɒn.dər/',
    type: 'noun',
    definition: 'The realisation that each random passerby is living a life as vivid and complex as one\'s own.',
    example: 'Sitting at the bus stop, she felt a wave of sonder watching strangers walk past.',
    origin: 'Invented by John Koenig, The Dictionary of Obscure Sorrows',
  },
  {
    word: 'Serendipity', pronunciation: '/ˌser.ənˈdɪp.ɪ.ti/',
    type: 'noun',
    definition: 'The occurrence of events by chance in a happy or beneficial way.',
    example: 'Finding that job was pure serendipity — he wasn\'t even looking.',
    origin: 'Persian fairy tale: The Three Princes of Serendip',
  },
  {
    word: 'Tenacious', pronunciation: '/tɪˈneɪ.ʃəs/',
    type: 'adjective',
    definition: 'Holding firmly to something; very determined and persistent.',
    example: 'Her tenacious spirit kept her going when everyone else had given up.',
    origin: 'Latin: tenax — holding fast',
  },
  {
    word: 'Loquacious', pronunciation: '/ləˈkweɪ.ʃəs/',
    type: 'adjective',
    definition: 'Tending to talk a great deal; talkative.',
    example: 'The loquacious host filled every silence with stories and jokes.',
    origin: 'Latin: loquax — talkative',
  },
  {
    word: 'Halcyon', pronunciation: '/ˈhæl.si.ən/',
    type: 'adjective',
    definition: 'Denoting a period of time in the past that was idyllically happy and peaceful.',
    example: 'She often thought back to those halcyon days of childhood summers.',
    origin: 'Greek mythology: a bird said to breed in a nest on the sea during calm weather',
  },
  {
    word: 'Perspicacious', pronunciation: '/ˌpɜː.spɪˈkeɪ.ʃəs/',
    type: 'adjective',
    definition: 'Having a ready insight into things; shrewd and observant.',
    example: 'The perspicacious detective noticed details others completely missed.',
    origin: 'Latin: perspicax — having clear sight',
  },
  {
    word: 'Eloquent', pronunciation: '/ˈel.ə.kwənt/',
    type: 'adjective',
    definition: 'Fluent or persuasive in speaking or writing.',
    example: 'Her eloquent speech moved the entire audience to tears.',
    origin: 'Latin: eloqui — to speak out',
  },
  {
    word: 'Resilience', pronunciation: '/rɪˈzɪl.i.əns/',
    type: 'noun',
    definition: 'The capacity to recover quickly from difficulties; toughness.',
    example: 'The community showed remarkable resilience after the flood.',
    origin: 'Latin: resilire — to spring back',
  },
  {
    word: 'Ineffable', pronunciation: '/ɪˈnef.ə.bəl/',
    type: 'adjective',
    definition: 'Too great or extreme to be expressed or described in words.',
    example: 'There was an ineffable sadness in her eyes that no words could capture.',
    origin: 'Latin: ineffabilis — unutterable',
  },
];

module.exports = {
  name: 'wod',
  aliases: ['wordofday', 'wordoftheday', 'vocab', 'vocabulary'],
  description: '📖 Get the Word of the Day with definition and example',
  category: 'tools',

  execute: async ({ reply }) => {
    // Pick word based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const w = WORDS[dayOfYear % WORDS.length];

    return reply(
      `📖 *Word of the Day*\n${'━'.repeat(30)}\n\n` +
      `✨ *${w.word}*  ${w.pronunciation}\n` +
      `📌 _${w.type}_\n\n` +
      `📝 *Definition:*\n${w.definition}\n\n` +
      `💬 *Example:*\n_"${w.example}"_\n\n` +
      `🌍 *Origin:* ${w.origin}\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
