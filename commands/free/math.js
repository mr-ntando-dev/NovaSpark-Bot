/**
 * NovaSpark Bot — Math Solver (FREE)
 * .math <problem>
 * Also auto-activated by smart detector when math is detected passively
 */
'use strict';

const APIs     = require('../../utils/api');
const database = require('../../database');

// ── Shared solve helper (used by auto-detector & command) ─────────────────────
async function solveMath(problem, profile) {
  const context = profile ? `Student: ${profile.name}, Age: ${profile.age}.` : '';
  const system  = `You are NovaSpark, a brilliant math tutor. ${context}
Solve the problem with full working. Structure your answer EXACTLY as:
*Problem:* (restate clearly)
*Method:* (which rule/formula is used)
*Step-by-Step Working:*
1. …
2. …
3. …
*Final Answer:* (clear, boxed answer)
*Quick Tip:* (1-line memory trick)
Use WhatsApp bold (*) for all section labels. Show every step — no skipping.`;
  return await APIs.chatAI(`Solve this math problem step by step: ${problem}`, system);
}

module.exports = {
  name: 'math',
  aliases: ['calculate', 'maths', 'calc', 'solve'],
  description: 'Solve any math problem with full step-by-step working (FREE)',
  category: 'free',

  // Exported for auto-detector use
  solveMath,

  execute: async ({ sock, from, sender, args, reply }) => {
    const problem = args.join(' ').trim();
    if (!problem) return reply(
      '🔢 Usage: *.math <problem>*\n\n' +
      'Examples:\n' +
      '  .math 2x + 5 = 15\n' +
      '  .math area of a circle with radius 7\n' +
      '  .math differentiate x² + 3x\n' +
      '  .math 25% of 340'
    );

    database.logCommand(sender, 'math');
    const profile = database.getProfile(sender.split('@')[0]);

    await sock.sendPresenceUpdate('composing', from);
    await reply('🔢 *Solving your math problem...*');

    try {
      const solution = await solveMath(problem, profile);
      await reply(`🔢 *Math Solver*\n\n${solution}\n\n_Nova AI ⚡_`);
    } catch {
      await reply('❌ Could not solve that right now. Try again!');
    }
  },
};
