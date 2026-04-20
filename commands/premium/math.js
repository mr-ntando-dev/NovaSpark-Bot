'use strict';
const APIs     = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'math',
  aliases: ['calculate', 'maths'],
  description: '[PREMIUM] Solve any math problem with full step-by-step working',
  category: 'premium',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const userId = sender.split('@')[0];
    if (!database.isPremium(userId)) return reply('💎 *.math* is a *Premium* feature.\nType *.myplan* for upgrade info.');
    const problem = args.join(' ').trim();
    if (!problem) return reply('🔢 Usage: *.math <problem>*\nExample: .math 2x + 5 = 15\nExample: .math area of a circle with radius 7');
    database.logCommand(sender, 'math');
    const profile = database.getProfile(userId);
    const context = profile ? `Student: ${profile.name}, Age: ${profile.age}.` : '';
    await sock.sendPresenceUpdate('composing', from);
    const system = `You are NovaSpark, a brilliant math tutor. ${context}
Solve the problem with full working. Structure your answer as:
*Problem:* (restate)
*Method:* (which method/rule/formula)
*Step-by-Step Working:* (numbered steps, show all work)
*Final Answer:* (clearly stated)
*Explanation:* (brief — why this works)
Use WhatsApp bold (*) for all section labels.`;
    try {
      const solution = await APIs.chatAI(`Solve this math problem: ${problem}`, system);
      await reply(`🔢 *Math Solver*\n\n${solution}\n\n_NovaSpark Bot ⚡_`);
    } catch {
      await reply('❌ Could not solve that right now. Try again!');
    }
  },
};
