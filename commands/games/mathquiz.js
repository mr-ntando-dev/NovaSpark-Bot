/**
 * ⚡ NovaSpark Bot — Math Quiz Game
 * .mathquiz [easy|medium|hard]  — timed math quiz with scoring
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

function genQuestion(level) {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const ops = ['+', '-', '*'];

  if (level === 'easy') {
    const a = rand(1, 20), b = rand(1, 20), op = ops[rand(0, 1)];
    const ans = op === '+' ? a + b : a - b;
    return { q: `${a} ${op} ${b}`, ans };
  }
  if (level === 'hard') {
    const a = rand(10, 99), b = rand(10, 99), op = ops[rand(0, 2)];
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { q: `${a} ${op} ${b}`, ans };
  }
  // medium
  const a = rand(1, 50), b = rand(1, 20), op = ops[rand(0, 2)];
  const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { q: `${a} ${op} ${b}`, ans };
}

const sessions = new Map(); // per-user session

module.exports = {
  name: 'mathquiz',
  aliases: ['mquiz', 'mathgame'],
  category: 'games',
  description: 'Timed math quiz game — answer 5 questions as fast as you can',
  usage: '.mathquiz [easy|medium|hard]',

  async execute({ sock, msg, from, args, reply, sender, body }) {
    const key     = `${from}_${sender}`;
    const session = sessions.get(key);

    // If a session is active, try to answer
    if (session) {
      const guess = parseInt(body.trim(), 10);
      if (isNaN(guess)) return reply('❓ That\'s not a number. Send your answer as a number!');

      clearTimeout(session.timer);

      if (guess === session.current.ans) {
        session.score++;
        session.streak = (session.streak || 0) + 1;
        const bonus = session.streak >= 3 ? ' 🔥 *Streak bonus!*' : '';
        const msg2 = `✅ *Correct!* +1${bonus}\nScore: *${session.score}/${session.total}*`;

        if (session.round >= session.total) {
          sessions.delete(key);
          const pct = Math.round(session.score / session.total * 100);
          let grade;
          if (pct === 100) grade = '🏆 Perfect Score!';
          else if (pct >= 80) grade = '🥇 Excellent!';
          else if (pct >= 60) grade = '🥈 Good job!';
          else if (pct >= 40) grade = '🥉 Keep practising!';
          else grade = '📚 Needs more practice';
          return reply(`${msg2}\n\n🎯 *Quiz Complete!*\nFinal Score: *${session.score}/${session.total}* (${pct}%)\n${grade}`);
        }

        session.round++;
        const next = genQuestion(session.level);
        session.current = next;
        session.timer = setTimeout(() => {
          sessions.delete(key);
          sock.sendMessage(from, { text: `⏰ *Time's up!* The answer was *${next.ans}*.\nGame over. Use \`.mathquiz\` to start again.` }, { quoted: msg });
        }, 20000);
        return reply(`${msg2}\n\n➡️ *Q${session.round}/${session.total}:*  \`${next.q} = ?\`\n_20 seconds to answer_`);
      } else {
        session.streak = 0;
        const msg2 = `❌ *Wrong!* The answer was *${session.current.ans}*`;

        if (session.round >= session.total) {
          sessions.delete(key);
          return reply(`${msg2}\n\n🎯 *Quiz Complete!*\nFinal Score: *${session.score}/${session.total}*`);
        }

        session.round++;
        const next = genQuestion(session.level);
        session.current = next;
        session.timer = setTimeout(() => {
          sessions.delete(key);
          sock.sendMessage(from, { text: `⏰ *Time's up!* The answer was *${next.ans}*.\nGame over. Use \`.mathquiz\` to start again.` }, { quoted: msg });
        }, 20000);
        return reply(`${msg2}\n\n➡️ *Q${session.round}/${session.total}:*  \`${next.q} = ?\`\n_20 seconds to answer_`);
      }
    }

    // Start new session
    const level = ['easy', 'medium', 'hard'].includes(args[0]) ? args[0] : 'medium';
    const first = genQuestion(level);
    const total = 5;

    const timer = setTimeout(() => {
      sessions.delete(key);
      sock.sendMessage(from, { text: `⏰ *Time's up!* The answer was *${first.ans}*.\nGame over. Use \`.mathquiz\` to start again.` }, { quoted: msg });
    }, 20000);

    sessions.set(key, { level, round: 1, total, score: 0, streak: 0, current: first, timer });

    return reply(
      `🧮 *Math Quiz — ${level.charAt(0).toUpperCase() + level.slice(1)} Mode*\n\n` +
      `${total} questions · 20 seconds each · Reply with the number\n\n` +
      `➡️ *Q1/${total}:*  \`${first.q} = ?\``
    );
  },
};
