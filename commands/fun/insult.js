/**
 * ⚡ NovaSpark Bot v5 — Insult
 * Savage (but funny) roast for a tagged user
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';

const INSULTS = [
  "You're not stupid — you just have bad luck thinking. 🧠❌",
  "I'd agree with you but then we'd both be wrong. 😂",
  "You're the reason the instructions on shampoo say 'rinse and repeat'. 🚿",
  "I thought of you today. It reminded me to take out the trash. 🗑️",
  "You bring everyone so much joy… when you leave the room. 😌",
  "I'd tell you to go outside but the neighbours have feelings too. 🌳",
  "You're like a cloud. When you disappear, it's a beautiful day. ☀️",
  "Your secrets are always safe with me. I never even listen when you talk. 👂",
  "I'm jealous of people who have never met you. 💀",
  "You're the human version of a participation trophy. 🏆",
  "If brains were petrol, you wouldn't have enough to power an ant's scooter. ⛽",
  "You are proof that even evolution makes mistakes. 🐒",
  "I'd insult your intelligence but it seems nature already did. 😏",
  "You have your whole life to be an idiot. Why not take today off? 📅",
  "Some people have a way with words. You have... the other way. 🗣️",
];

module.exports = {
  name: 'insult',
  aliases: ['savage', 'diss'],
  category: 'fun',
  description: 'Savage roast for a tagged member',
  usage: '.insult @user',

  async execute(sock, msg, args, extra) {
    try {
      const ctx       = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      const target    = mentioned[0] || null;
      const insult    = INSULTS[Math.floor(Math.random() * INSULTS.length)];

      if (target) {
        const tag = `@${target.split('@')[0]}`;
        await sock.sendMessage(extra.from, {
          text: `😤 ${tag}\n\n${insult}`,
          mentions: [target],
        }, { quoted: msg });
      } else {
        await extra.reply(`😤 ${insult}`);
      }
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
