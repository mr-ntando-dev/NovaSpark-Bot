/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .dadjoke — Random dad joke
 * By Dev-Ntando
 */
'use strict';

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything! 😂",
  "I'm reading a book about anti-gravity. It's impossible to put down! 📚",
  "Did you hear about the claustrophobic astronaut? He just needed a little space. 🚀",
  "Why can't you give Elsa a balloon? Because she'll let it go! 🎈",
  "I used to hate facial hair, but then it grew on me. 🧔",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "How do you organize a space party? You planet! 🌍",
  "What's a vampire's favourite fruit? A blood orange! 🧛",
  "I'm on a seafood diet. I see food and I eat it! 🍔",
  "Why did the bicycle fall over? It was two-tired! 🚲",
  "What do you call cheese that isn't yours? Nacho cheese! 🧀",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "What do you call a sleeping dinosaur? A dino-snore! 🦕",
  "Why did the math book look so sad? It had too many problems! 📖",
  "I told my wife she was drawing her eyebrows too high. She looked surprised! 😮",
  "Why can't Cinderella play soccer? She always runs away from the ball! ⚽",
  "What do you call a factory that makes okay products? A satisfactory! 🏭",
  "Why do cows wear bells? Because their horns don't work! 🐄",
  "What do you call a bear with no teeth? A gummy bear! 🐻",
  "I used to be a banker but I lost interest! 💰",
  "Why did the golfer bring an extra pair of pants? In case he got a hole in one! 🏌️",
  "What's brown and sticky? A stick! 🌿",
  "Why can't you play poker in the jungle? Too many cheetahs! 🐆",
  "What do you call an alligator in a vest? An investigator! 🐊",
];

module.exports = {
  name: 'dadjoke',
  aliases: ['dadj', 'pun', 'punny'],
  description: '😂 Get a random dad joke / pun',
  category: 'fun',

  execute: async ({ reply }) => {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    return reply(`👨 *Dad Joke*\n${'━'.repeat(28)}\n\n${joke}\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
  },
};
