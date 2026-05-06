'use strict';
const APIs     = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'homework',
  aliases: ['hw', 'helphw', 'answer'],
  description: 'Get a detailed AI answer to any homework question',
  category: 'free',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const question = args.join(' ').trim();
    if (!question) return reply('📚 Usage: *.homework <your question>*\n\nExamples:\n  .homework What is photosynthesis?\n  .homework Explain the causes of World War 1\n  .homework How do you find the area of a triangle?');
    database.logCommand(sender, 'homework');
    const profile = database.getProfile(sender.split('@')[0]);
    const context = profile ? `Student: ${profile.name}, Age: ${profile.age}, School: ${profile.school}.` : '';
    await sock.sendPresenceUpdate('composing', from);
    await reply('📚 *Solving your homework...*');
    const system = `You are NovaSpark, a brilliant homework helper and tutor. ${context}
Give a clear, well-structured, step-by-step answer. Include:
- *Direct Answer* first (1-2 sentences)
- *Explanation / Working* — detailed breakdown
- *Key Concepts* to remember
- *Example* if it helps clarify
Format using WhatsApp bold (*) for section labels. Be thorough but easy to understand.
If it is a math/science problem, show all working. If it is an essay question, give a full outline.`;
    try {
      const answer = await APIs.chatAI(question, system);
      await reply(`📚 *Homework Helper*\n\n*Q:* ${question}\n\n${answer}\n\n_Nova AI ⚡_`);
    } catch {
      await reply('❌ Could not get an answer right now. Try again in a moment!');
    }
  },
};
