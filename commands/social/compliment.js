/**
 * ⚡ NovaSpark v4 — Compliment + Insult Generator
 * .compliment [@user] — Kind AI compliment
 * .insult [@user] — Savage (funny, not cruel) roast
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const COMPLIMENTS = [
  "You light up every group you're in like a solar panel on a sunny day. ☀️",
  "Your energy is the reason people actually read the group chat. 💪",
  "You're the kind of person who makes others feel like they can do anything.",
  "You've got the rare talent of making hard things look easy.",
  "Honestly? You're one of the best things about this group. Don't tell anyone I said that.",
  "You're the WiFi in a world full of no signal — everyone needs you around. 📶",
  "Your vibe is immaculate. Whatever you're selling, I'd buy two.",
  "If effort were a currency, you'd be a billionaire.",
];

const INSULTS = [
  "If your brain were dynamite, there wouldn't be enough to blow your hat off.",
  "I've seen better plans from a vending machine.",
  "You're not the dumbest person in the world, but you should pray that person doesn't die.",
  "Somewhere out there is a tree tirelessly producing oxygen for you. You owe it an apology.",
  "Your GPS must be broken — you always end up in the wrong place. 📍",
  "I'd agree with you, but then we'd both be wrong.",
  "You're the reason they put instructions on shampoo.",
  "I'm not saying you're slow, but it takes you 1.5 hours to watch 60 Minutes.",
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  {
    name: 'compliment',
    aliases: ['hype', 'praise'],
    description: '🌸 Give someone a genuine AI compliment',
    category: 'social',
    execute: async ({ sock, msg, from, sender, mentions, reply }) => {
      const target = mentions?.[0] || sender;
      const num    = target.split('@')[0];
      await sock.sendMessage(from, {
        text: `🌸 @${num}\n\n"${rand(COMPLIMENTS)}"\n\n_— NovaSpark Bot ⚡_`,
        mentions: [target],
      });
    },
  },
  {
    name: 'insult',
    aliases: ['roast2', 'savage'],
    description: '😈 Roast someone (funny, not cruel)',
    category: 'social',
    execute: async ({ sock, msg, from, sender, mentions, reply }) => {
      const target = mentions?.[0] || sender;
      const num    = target.split('@')[0];
      await sock.sendMessage(from, {
        text: `😈 @${num}\n\n"${rand(INSULTS)}"\n\n_— NovaSpark Bot ⚡ (no hard feelings 😂)_`,
        mentions: [target],
      });
    },
  },
];
