/**
 * ⚡ NovaSpark v4 — Truth or Dare
 * .truth — Get a truth question
 * .dare  — Get a dare challenge
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const TRUTHS = [
  "What's the most embarrassing thing you've ever done?",
  "Who was your first crush and what happened?",
  "What's a secret you've never told anyone?",
  "What's the worst lie you've ever told?",
  "What's your biggest fear?",
  "Have you ever cheated on a test?",
  "What's the most childish thing you still do?",
  "What's the strangest dream you've ever had?",
  "Have you ever ghosted someone?",
  "What's something you pretend to like but actually hate?",
];

const DARES = [
  "Send a voice note singing any song right now.",
  "Change your WhatsApp status to 'I love NovaSpark Bot ⚡' for 1 hour.",
  "Send a funny selfie.",
  "Write a poem about the last person who messaged you.",
  "Text someone 'I have something to tell you' and leave them on read for 5 minutes.",
  "Do your best impression of another group member via voice note.",
  "Change your profile picture to something embarrassing for 30 minutes.",
  "Send a voice note of yourself making animal sounds for 10 seconds.",
  "Message your last contact 'I miss you 🥺' with no explanation.",
  "Do 10 push-ups right now and send a voice note counting them.",
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  {
    name: 'truth',
    aliases: ['tod-truth'],
    description: '🤔 Get a truth question for Truth or Dare',
    category: 'social',
    execute: async ({ reply }) => {
      return reply(`🤔 *TRUTH*\n\n_${rand(TRUTHS)}_\n\n_Can you handle it? 👀_`);
    },
  },
  {
    name: 'dare',
    aliases: ['tod-dare'],
    description: '😈 Get a dare challenge',
    category: 'social',
    execute: async ({ reply }) => {
      return reply(`😈 *DARE*\n\n_${rand(DARES)}_\n\n_Do it or forfeit! 🔥_`);
    },
  },
];
