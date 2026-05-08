/**
 * ⚡ NovaSpark Bot — Group Type Racer
 * .typeracer  — first person to type the phrase wins
 * By Dev-Ntando
 */
'use strict';

const config = require('../../config');

const PHRASES = [
  'NovaSpark Bot is the fastest bot in Zimbabwe',
  'The quick brown fox jumped over the lazy dog',
  'WhatsApp is the most popular messaging app worldwide',
  'Speed is nothing without accuracy and control',
  'Technology connects people across the entire globe',
  'The best time to start something new is right now',
  'Practice makes perfect if you never stop trying hard',
  'Every great developer was once a complete beginner',
  'Code is like poetry when written with skill and care',
  'Hard work beats talent when talent does not work hard',
];

const sessions = new Map(); // groupJid → session

module.exports = {
  name: 'typeracer',
  aliases: ['typeracing', 'typingrace', 'race'],
  category: 'fun',
  description: 'Group typing race — first one to type the phrase wins!',
  usage: '.typeracer',
  groupOnly: true,

  async execute({ sock, msg, from, args, reply, sender, body }) {
    const session = sessions.get(from);

    if (session && args[0]?.toLowerCase() === 'stop') {
      clearTimeout(session.timer);
      sessions.delete(from);
      return reply('🛑 Type Race cancelled by admin.');
    }

    if (session) {
      return reply('⚡ A race is already running! Type the phrase to win.');
    }

    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];

    await sock.sendMessage(from, {
      text:
        `🏁 *TYPE RACER — Starting in 3 seconds!*\n\n` +
        `📝 Get ready to type:\n\n` +
        `\`\`\`${phrase}\`\`\`\n\n` +
        `_First person to type it exactly wins! 🏆_`,
    }, { quoted: msg });

    await new Promise(r => setTimeout(r, 3000));

    const timer = setTimeout(async () => {
      sessions.delete(from);
      await sock.sendMessage(from, { text: `⏰ *Time\'s up!* Nobody finished in time.\nThe phrase was:\n_"${phrase}"_` }, { quoted: msg });
    }, 45000);

    sessions.set(from, { phrase, startTime: Date.now(), timer });

    await sock.sendMessage(from, {
      text: `🚦 *GO! GO! GO!*\n\n\`\`\`${phrase}\`\`\`\n\n_45 seconds on the clock!_`,
    });
  },

  // This hook must be called from the main message handler
  async onMessage({ sock, msg, from, body, sender }) {
    const session = sessions.get(from);
    if (!session) return false;

    if (body.trim() === session.phrase) {
      clearTimeout(session.timer);
      sessions.delete(from);

      const elapsed = ((Date.now() - session.startTime) / 1000).toFixed(2);
      const wpm     = Math.round((session.phrase.split(' ').length / elapsed) * 60);

      await sock.sendMessage(from, {
        text:
          `🏆 *WINNER!*\n\n` +
          `👑 @${sender.split('@')[0]} finished first!\n` +
          `⏱️ Time: *${elapsed}s*\n` +
          `💨 Speed: *${wpm} WPM*\n\n` +
          `🎉 Congratulations!`,
        mentions: [sender],
      }, { quoted: msg });

      return true;
    }
    return false;
  },
};
