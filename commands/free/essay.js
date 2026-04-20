/**
 * NovaSpark Bot — Essay Writer (Free)
 * .essay <topic>
 */
'use strict';
const APIs    = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'essay',
  aliases: ['write', 'writeessay'],
  description: 'Write a full structured essay on any topic',
  category: 'free',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const topic = args.join(' ').trim();
    if (!topic) return reply('✍️ Usage: *.essay <topic>*\nExample: .essay Climate Change');

    database.logCommand(sender, 'essay');
    const profile = database.getProfile(sender.split('@')[0]);
    const level   = profile ? `Write for a ${profile.age}-year-old student at ${profile.school}.` : '';

    await sock.sendPresenceUpdate('composing', from);
    await reply('✍️ *Writing your essay...*');

    const system = `You are NovaSpark, an expert essay writer. ${level}
Write a complete, well-structured essay with:
- Introduction (hook + thesis)
- 3 body paragraphs (topic sentence, evidence, explanation)
- Conclusion (restate thesis + final thought)
Use WhatsApp bold (*) for section titles. Write in clear, academic English.`;

    try {
      const essay = await APIs.chatAI(`Write a full essay on: "${topic}"`, system);
      await reply(`✍️ *Essay: ${topic}*\n\n${essay}\n\n_Written by NovaSpark Bot ⚡_`);
    } catch {
      await reply('❌ Couldn\'t write the essay right now. Try again!');
    }
  },
};
