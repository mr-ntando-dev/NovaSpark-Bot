'use strict';
const APIs    = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'studytips',
  aliases: ['tips', 'study'],
  description: 'Get AI-powered study tips for any subject',
  category: 'free',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    database.logCommand(sender, 'studytips');
    const subject = args.join(' ').trim() || 'general studying';
    const profile = database.getProfile(sender.split('@')[0]);
    const context = profile ? `Student: ${profile.name}, Age: ${profile.age}, School: ${profile.school}.` : '';
    await sock.sendPresenceUpdate('composing', from);
    const system = `You are NovaSpark, a brilliant academic coach. ${context}
Give 5-7 practical, specific study tips for the subject. Include memory tricks, time management advice, and motivation. Use WhatsApp bold (*) for tip titles.`;
    try {
      const tips = await APIs.chatAI(`Give study tips for: ${subject}`, system);
      await reply(`📖 *Study Tips: ${subject}*\n\n${tips}\n\n_NovaSpark Bot ⚡_`);
    } catch {
      await reply('❌ Couldn\'t get tips right now. Try again!');
    }
  },
};
