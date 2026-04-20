/**
 * ⚡ NovaSpark Bot — Would You Rather
 * .wyr — presents a random dilemma
 * By Dev-Ntando
 */
'use strict';

const QUESTIONS = [
  ['Have the ability to fly', 'Be invisible whenever you want'],
  ['Always speak your mind', 'Never be able to speak again'],
  ['Be famous but broke', 'Be rich but unknown'],
  ['Live without music', 'Live without the internet'],
  ['Fight 1 horse-sized duck', '100 duck-sized horses'],
  ['Have unlimited money but no friends', 'Have unlimited friends but no money'],
  ['Never eat your favourite food again', 'Only eat your favourite food forever'],
  ['Be able to read minds', 'Be able to travel through time'],
  ['Have 10 extra years at the end of life', '10 extra hours every day now'],
  ['Know when you die', 'Know how you die'],
  ['Always be 10 minutes late', 'Always be 20 minutes early'],
  ['Live in the ocean forever', 'Live in space forever'],
  ['Be able to speak every language', 'Be able to play every instrument'],
  ['Never have homework', 'Never have tests'],
  ['Eat a spoonful of wasabi', 'Eat a spoonful of ghost pepper sauce'],
];

module.exports = {
  name: 'wyr',
  aliases: ['wouldyourather', 'would'],
  category: 'fun',
  description: 'Would You Rather — a random dilemma',
  usage: '.wyr',

  async execute({ reply }) {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    return reply(
      `🤔 *Would You Rather...*\n\n` +
      `*A)* ${q[0]}\n` +
      `   — OR —\n` +
      `*B)* ${q[1]}\n\n` +
      `_Reply A or B to vote!_`
    );
  },
};
