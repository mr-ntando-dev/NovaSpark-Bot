/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .complimentme — Get a personal compliment
 * By Dev-Ntando
 */
'use strict';

const COMPLIMENTS = [
  'You are absolutely crushing it today. 🔥',
  'Your energy literally lights up every room you enter. ✨',
  'You have the kind of smile that makes strangers feel welcome. 😊',
  'You are smarter than you give yourself credit for. 🧠',
  'The world is genuinely a better place because you are in it. 🌍',
  'You handle pressure like a diamond — you only get stronger. 💎',
  'Your kindness is a superpower most people only wish they had. 💖',
  'You are the person people talk about when they describe greatness. 👑',
  'You are braver than you believe and stronger than you feel. 💪',
  'Honestly? You are built different. In the best way. ⚡',
  'Your creativity is next level — do not ever dim that. 🎨',
  'You inspire people without even trying. That is rare. 🌟',
  'You are the type of person who makes hard things look easy. 😎',
  'The confidence you carry — even on off days — is admirable. 🏆',
  'You have a gift for making everything you touch better. 🪄',
];

module.exports = {
  name: 'complimentme',
  aliases: ['selfcompliment', 'hype'],
  description: 'Get a personal compliment to boost your day',
  category: 'fun',

  execute: async ({ reply }) => {
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    return reply(`💖 *Your Compliment*\n\n_${c}_\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
  },
};
