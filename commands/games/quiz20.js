/**
 * ⚡ NovaSpark Bot — 20 Questions Game
 * .quiz20  — Bot picks a concept, user asks yes/no questions to guess it
 * By Dev-Ntando
 */
'use strict';

const ITEMS = [
  { w: 'elephant',    hints: ['animal', 'large', 'grey', 'has trunk'] },
  { w: 'pizza',       hints: ['food', 'Italian', 'round', 'has cheese'] },
  { w: 'guitar',      hints: ['musical instrument', 'strings', 'wooden'] },
  { w: 'moon',        hints: ['space', 'orbits Earth', 'visible at night'] },
  { w: 'fire',        hints: ['hot', 'produces light', 'burns'] },
  { w: 'smartphone',  hints: ['technology', 'portable', 'has screen'] },
  { w: 'diamond',     hints: ['gem', 'hardest mineral', 'sparkles'] },
  { w: 'airplane',    hints: ['vehicle', 'flies', 'has wings'] },
  { w: 'ocean',       hints: ['water', 'very large', 'has waves'] },
  { w: 'library',     hints: ['building', 'has books', 'quiet place'] },
  { w: 'clock',       hints: ['device', 'tells time', 'has hands'] },
  { w: 'tree',        hints: ['plant', 'has leaves', 'grows tall'] },
  { w: 'doctor',      hints: ['person', 'helps sick people', 'wears white coat'] },
  { w: 'rainbow',     hints: ['natural phenomenon', 'has 7 colors', 'after rain'] },
  { w: 'chocolate',   hints: ['food', 'sweet', 'made from cacao'] },
];

const YES_WORDS  = ['yes', 'yeah', 'yep', 'yup', 'correct', 'right', 'true', 'y'];
const NO_WORDS   = ['no', 'nope', 'nah', 'wrong', 'false', 'n', 'not'];
const sessions   = new Map();

module.exports = {
  name: 'quiz20',
  aliases: ['twentyquestions', '20q'],
  category: 'games',
  description: 'Classic 20 Questions game — ask yes/no questions to guess the word',
  usage: '.quiz20',

  async execute({ sock, msg, from, args, reply, sender, body }) {
    const key     = `${from}_${sender}`;
    const session = sessions.get(key);
    const input   = body.trim().toLowerCase();

    if (!session || input === 'start' || input === '.quiz20') {
      const item      = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const maxQ      = 20;
      sessions.set(key, { item, questions: 0, maxQ, hints: item.hints.slice() });

      return reply(
        `🕵️ *20 Questions Game!*\n\n` +
        `I'm thinking of something...\n` +
        `Ask me *yes/no questions* to figure out what it is!\n` +
        `You have *${maxQ} questions*.\n\n` +
        `When you think you know, type your answer!\n` +
        `_Hint: type "hint" for a clue_`
      );
    }

    // Hint request
    if (input === 'hint') {
      const h = session.hints.shift();
      if (!h) return reply('🤷 No more hints! You\'re on your own.');
      return reply(`💡 *Hint:* It is ${h}`);
    }

    // Guess attempt (not a yes/no question)
    const isQuestion = input.endsWith('?') ||
      input.startsWith('is ') || input.startsWith('are ') ||
      input.startsWith('does ') || input.startsWith('can ') ||
      input.startsWith('has ') || input.startsWith('was ') ||
      input.startsWith('did ');

    if (!isQuestion) {
      // Treat as a guess
      const { item } = session;
      if (input.includes(item.w.toLowerCase())) {
        sessions.delete(key);
        return reply(`🎉 *YES! You got it!* It was *${item.w}*!\nQuestions asked: *${session.questions}*\n\n_Type \`.quiz20\` to play again!_`);
      } else {
        session.questions++;
        if (session.questions >= session.maxQ) {
          sessions.delete(key);
          return reply(`💀 *Game Over!* Wrong guess and out of questions.\nThe answer was *${item.w}*.\n\n_Type \`.quiz20\` to play again!_`);
        }
        return reply(`❌ *Nope, that's not it!* Keep guessing!\nQuestions left: *${session.maxQ - session.questions}*`);
      }
    }

    // Yes/No answer
    session.questions++;
    const { item } = session;

    // Simple keyword matching for yes/no
    let answer;
    const q = input;
    if (q.includes('animal') || q.includes('living') || q.includes('creature')) {
      answer = ['elephant'].includes(item.w) ? 'yes' : 'no';
    } else if (q.includes('food') || q.includes('eat')) {
      answer = ['pizza', 'chocolate'].includes(item.w) ? 'yes' : 'no';
    } else if (q.includes('technology') || q.includes('electronic') || q.includes('device')) {
      answer = ['smartphone', 'clock'].includes(item.w) ? 'yes' : 'no';
    } else if (q.includes('music') || q.includes('instrument')) {
      answer = ['guitar'].includes(item.w) ? 'yes' : 'no';
    } else if (q.includes('big') || q.includes('large')) {
      answer = ['elephant', 'ocean', 'airplane'].includes(item.w) ? 'yes' : 'no';
    } else if (q.includes('fly') || q.includes('air')) {
      answer = ['airplane', 'moon'].includes(item.w) ? 'yes' : 'no';
    } else {
      // Random yes/no weighted slightly toward the item
      answer = Math.random() > 0.6 ? 'no' : 'yes';
    }

    if (session.questions >= session.maxQ) {
      sessions.delete(key);
      return reply(
        `${answer === 'yes' ? '✅ Yes!' : '❌ No!'}\n\n` +
        `💀 *You've run out of questions!*\n` +
        `The answer was *${item.w}*.\n\n_Type \`.quiz20\` to play again!_`
      );
    }

    return reply(
      `${answer === 'yes' ? '✅ *Yes!*' : '❌ *No!*'}\n\n` +
      `Questions left: *${session.maxQ - session.questions}*\n` +
      `_Type "hint" for a clue_`
    );
  },
};
