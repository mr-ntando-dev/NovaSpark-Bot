/**
 * ⚡ NovaSpark Bot v5 — Truth
 * Truth question for Truth or Dare
 * Inspired by KnightBot-Mini | By Dev-Ntando
 */
'use strict';

const TRUTHS = [
  "What's the most embarrassing thing you've ever done in public? 😳",
  "Have you ever lied to get out of trouble? What was the lie? 🤥",
  "What's your biggest fear and why? 😱",
  "Have you ever had feelings for someone in this chat? 💞",
  "What's the worst thing you've done that you never got caught for? 😅",
  "If you could delete one thing from your past, what would it be? 🗑️",
  "What's the most childish thing you still do? 🍼",
  "Have you ever cheated in a game or test? 📋",
  "What's a secret you've been hiding for the longest time? 🤫",
  "Would you rather lose your phone or your wallet for a week? 📱💳",
  "What's the most embarrassing song in your playlist? 🎵",
  "Who was your first crush? Do they know? ❤️",
  "What's something you've done that you're not proud of? 😬",
  "Have you ever stood someone up? What happened? 😶",
  "What's the boldest lie you've ever told your parents? 🤫",
];

module.exports = {
  name: 'truth',
  aliases: ['tod', 'askme'],
  category: 'fun',
  description: 'Get a Truth question for Truth or Dare',
  usage: '.truth',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const q = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
    await reply(`🎯 *TRUTH*\n\n${q}`);
  },
};
