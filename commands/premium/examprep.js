'use strict';
const APIs     = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'examprep',
  aliases: ['exam', 'revise', 'revision'],
  description: '[PREMIUM] Full exam revision notes for any subject',
  category: 'premium',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const userId = sender.split('@')[0];
    if (!database.isPremium(userId)) return reply('💎 .examprep is a *Premium* feature.\nType *.myplan* to see upgrade info.');
    const subject = args.join(' ').trim();
    if (!subject) return reply('🎓 Usage: *.examprep <subject>*\nExample: .examprep Mathematics Grade 10');
    database.logCommand(sender, 'examprep');
    const profile = database.getProfile(userId);
    const context = profile ? `Student: ${profile.name}, Age: ${profile.age}, School: ${profile.school}.` : '';
    await sock.sendPresenceUpdate('composing', from);
    await reply('🎓 *Preparing your exam revision notes...*');
    const system = `You are NovaSpark, an elite exam preparation tutor. ${context}
Create comprehensive exam revision notes. Include:
- *Key Topics* — all major areas
- *Important Definitions* — clearly explained
- *Key Formulas/Rules* — where applicable
- *5 Common Exam Questions* with model answers
- *Memory Tips* — mnemonics and tricks
- *Last-Minute Tips* — what to prioritize
Use WhatsApp bold (*) for all headings. Be thorough and exam-focused.`;
    try {
      const notes = await APIs.chatAI(`Create full exam revision notes for: ${subject}`, system);
      await reply(`🎓 *Exam Prep: ${subject}*\n\n${notes}\n\n_Good luck! You got this! 💪 — NovaSpark Bot ⚡_`);
    } catch {
      await reply('❌ Failed to generate notes. Try again!');
    }
  },
};
