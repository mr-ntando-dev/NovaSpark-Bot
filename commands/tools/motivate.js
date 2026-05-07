/**
 * ⚡ NovaSpark v4 — Daily Motivation
 * .motivate — Random motivational quote (live from quotable.io)
 * .motivate @user — Tag someone with motivation
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'motivate',
  aliases: ['motivequote', 'motiveinspire'],
  description: '💪 Live motivational quote — optionally tag a friend',
  category: 'tools',

  execute: async ({ sock, msg, from, sender, args, reply, mentions }) => {
    const target = mentions?.[0];
    try {
      const { data } = await axios.get('https://api.quotable.io/random?tags=motivational|success|inspirational', { timeout: 6000 });
      const quote  = data.content;
      const author = data.author;
      const prefix = target ? `@${target.split('@')[0]} — here's something for you:\n\n` : '';
      const msgTxt = `💪 *Daily Motivation*\n\n${prefix}"${quote}"\n\n— _${author}_\n\n_⚡ NovaSpark Bot v4_`;
      if (target) {
        return await sock.sendMessage(from, { text: msgTxt, mentions: [target] }, { quoted: msg });
      }
      return reply(msgTxt);
    } catch {
      return reply('💪 *"You didn\'t come this far only to come this far. Keep going."*\n— _NovaSpark_');
    }
  },
};
