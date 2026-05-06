/**
 * NovaSpark Bot — Math Solver (FREE)
 * .math <problem>         — Solve a single problem
 * .math paper <text>      — Solve a full question paper (all questions)
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

// ── Full paper solver — handles multiple questions ────────────────────────────
async function solveFullPaper(paperText, profile) {
  const context = profile ? `Student: ${profile.name}, Age: ${profile.age}.` : '';
  const system  = `You are NovaSpark, a brilliant math tutor solving a FULL EXAM/QUESTION PAPER. ${context}
The student has given you a full question paper with multiple questions. You MUST solve EVERY question completely.

For EACH question, structure your answer as:

━━━━━━━━━━━━━━━━━━━━━━━━
*Question [N]:* (restate question)
*Method:* (formula/rule used)
*Working:*
1. …
2. …
3. …
*Answer:* (final answer clearly stated)
━━━━━━━━━━━━━━━━━━━━━━━━

Important rules:
- Solve ALL questions — do not skip any
- If a question has sub-parts (a, b, c, etc) solve EACH sub-part
- Show full working for every step
- Use WhatsApp bold (*) for labels
- If you see "marks" in brackets like [3], note it but solve fully regardless
- If any question is unclear, state your interpretation then solve it
- At the end, give a *Summary* with all final answers listed together`;

  return await APIs.chatAI(`Solve this complete math question paper. Solve EVERY question with full working:\n\n${paperText}`, system);
}

module.exports = {
  name: 'math',
  aliases: ['calculate', 'maths', 'calc', 'solve'],
  description: 'Solve any math problem or full question paper with step-by-step working (FREE)',
  category: 'free',

  // Exported for auto-detector use
  solveMath,
  solveFullPaper,

  execute: async ({ sock, from, sender, args, reply }) => {
    const sub = (args[0] || '').toLowerCase();

    // ── Full paper mode ─────────────────────────────────────────────────────
    if (sub === 'paper' || sub === 'exam' || sub === 'test' || sub === 'qp') {
      const paperText = args.slice(1).join(' ').trim();
      if (!paperText) return reply(
        '📝 *Full Paper Solver*\n\n' +
        'Usage: *.math paper <paste full question paper>*\n\n' +
        'You can also:\n' +
        '• Reply to a message containing the questions with *.math paper*\n' +
        '• Send a photo of the paper with caption *.math paper*\n\n' +
        'Example:\n' +
        '*.math paper*\n' +
        'Q1. Solve 2x + 5 = 15 [3]\n' +
        'Q2. Find the area of a circle with radius 7cm [4]\n' +
        'Q3(a) Differentiate y = x² + 3x [2]\n' +
        '   (b) Find the gradient at x=2 [2]'
      );

      database.logCommand(sender, 'math_paper');
      const profile = database.getProfile ? database.getProfile(sender.split('@')[0]) : null;

      await sock.sendPresenceUpdate('composing', from);
      await reply('📝 *Solving your full question paper...*\n_This may take a moment — solving all questions._');

      try {
        const solution = await solveFullPaper(paperText, profile);
        // Split if too long for WhatsApp (4096 char limit)
        if (solution.length > 4000) {
          const parts = splitMessage(solution, 3900);
          for (let i = 0; i < parts.length; i++) {
            const header = i === 0 ? '📝 *Full Paper Solution*\n\n' : `📝 *Continued (${i + 1}/${parts.length})*\n\n`;
            await reply(`${header}${parts[i]}`);
          }
          await reply('✅ *All questions solved!*\n_Nova AI ⚡_');
        } else {
          await reply(`📝 *Full Paper Solution*\n\n${solution}\n\n✅ _All questions solved! — Nova AI ⚡_`);
        }
      } catch {
        await reply('❌ Could not solve the paper right now. Try again or send fewer questions at a time!');
      }
      return;
    }

    // ── Single problem mode ─────────────────────────────────────────────────
    const problem = args.join(' ').trim();
    if (!problem) return reply(
      '🔢 Usage: *.math <problem>*\n' +
      '📝 Full paper: *.math paper <all questions>*\n\n' +
      'Examples:\n' +
      '  .math 2x + 5 = 15\n' +
      '  .math area of a circle with radius 7\n' +
      '  .math differentiate x² + 3x\n' +
      '  .math 25% of 340\n\n' +
      '*Full Paper Mode:*\n' +
      '  .math paper Q1. solve 3x=9 Q2. find area of...\n' +
      '  (paste your entire question paper after "paper")'
    );

    database.logCommand(sender, 'math');
    const profile = database.getProfile ? database.getProfile(sender.split('@')[0]) : null;

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

// ── Helper to split long messages ─────────────────────────────────────────────
function splitMessage(text, maxLen) {
  const parts = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let splitIdx = remaining.lastIndexOf('\n', maxLen);
    if (splitIdx < maxLen * 0.5) splitIdx = maxLen;
    parts.push(remaining.slice(0, splitIdx));
    remaining = remaining.slice(splitIdx).trimStart();
  }
  if (remaining) parts.push(remaining);
  return parts;
}
