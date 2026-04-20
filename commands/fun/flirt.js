/**
 * ⚡ NovaSpark Bot v5 — Flirt
 * Send a flirty pickup line to a tagged user
 * Original NovaSpark command | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const LINES = [
  "Are you a magician? Because whenever I look at you, everyone else disappears. ✨",
  "Do you have a map? I keep getting lost in your eyes. 🗺️",
  "Are you a parking ticket? Because you've got 'fine' written all over you. 😏",
  "Do you believe in love at first text? Because you had me at 'hey'. 💬",
  "Are you Wi-Fi? Because I'm feeling a connection. 📶",
  "Is your name Google? Because you have everything I've been searching for. 🔍",
  "If you were a vegetable, you'd be a cutecumber. 🥒",
  "Do you have a Band-Aid? Because I scraped my knee falling for you. 🩹",
  "Are you a keyboard? Because you're exactly my type. ⌨️",
  "I must be a snowflake, because I've fallen for you. ❄️",
  "Do you have a star map? Because I keep getting lost in your constellation. ⭐",
  "Are you made of copper and tellurium? Because you are CuTe. 🧪",
  "Is your name Wifi? Because I'm feeling a strong connection. 💞",
  "If being beautiful was a crime, you'd be serving a life sentence. 😍",
  "Do you like science? Because I've got great chemistry with you. ⚗️",
];

module.exports = {
  name: 'flirt',
  aliases: ['pickup', 'pickupline', 'pl'],
  category: 'fun',
  description: 'Send a flirty pickup line to someone',
  usage: '.flirt @user',

  async execute(sock, msg, args, extra) {
    try {
      const ctx       = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      const target    = mentioned[0] || null;
      const line      = LINES[Math.floor(Math.random() * LINES.length)];

      if (target) {
        const tag = `@${target.split('@')[0]}`;
        await sock.sendMessage(extra.from, {
          text: `💌 Hey ${tag}!\n\n${line}`,
          mentions: [target],
        }, { quoted: msg });
      } else {
        await extra.reply(`💌 ${line}`);
      }
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
