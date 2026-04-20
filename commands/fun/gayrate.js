/**
 * ⚡ NovaSpark Bot v5 — GayRate / Vibe Check
 * Purely silly fun — generates a random "vibe" percentage
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';

const MESSAGES = [
  (tag, p) => `${tag} is *${p}%* fabulous ✨🌈`,
  (tag, p) => `Rainbow compatibility: *${p}%* for ${tag} 🎨`,
  (tag, p) => `${tag} vibes at *${p}%* pure glitter sparkle 💖`,
  (tag, p) => `Vibe check: ${tag} scored *${p}%* on the sparkle scale ⭐`,
  (tag, p) => `${tag} is *${p}%* certified icon 😂`,
];

module.exports = {
  name: 'gayrate',
  aliases: ['vibecheck', 'sparkle', 'gr'],
  category: 'fun',
  description: 'Silly vibe percentage check',
  usage: '.gayrate [@user]',

  async execute(sock, msg, args, extra) {
    try {
      const ctx       = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      const target    = mentioned[0] || extra.sender;
      const tag       = `@${target.split('@')[0]}`;

      // deterministic-ish: hash sender + today's date so it stays the same day
      const seed = target.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const date = new Date().toDateString();
      const dateSeed = date.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const pct  = ((seed + dateSeed) % 101);

      const template = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      await sock.sendMessage(extra.from, {
        text: `🎭 ${template(tag, pct)}`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
