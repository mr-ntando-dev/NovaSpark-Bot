/**
 * ⚡ NovaSpark v9 — Personality Test
 * .personality — Answer 5 quick questions to reveal your personality type
 * One question at a time. Fun for groups!
 * By Dev-Ntando
 */
'use strict';

const QUIZ = [
  {
    q: 'When a new group chat is created, you...',
    opts: ['A. Immediately say hi and hype everyone up 🎉', 'B. Read all the messages first, then join the convo 🙂', 'C. Stay silent and only reply when tagged 🤫', 'D. Create a poll or plan something 📊'],
  },
  {
    q: 'Your perfect weekend is...',
    opts: ['A. A big party with lots of people 🎊', 'B. Chilling at home with close friends 🛋️', 'C. A solo adventure — hiking, reading, exploring 🏔️', 'D. Working on a side project or business idea 💼'],
  },
  {
    q: 'When something goes wrong, you...',
    opts: ['A. Vent to everyone and get it off your chest 💬', 'B. Talk to one trusted person about it 🤝', 'C. Sit with it quietly and figure it out alone 🧘', 'D. Make a plan immediately to fix it 📋'],
  },
  {
    q: 'Your friends would describe you as...',
    opts: ['A. The life of the party 🥳', 'B. The warm, supportive one 💛', 'C. The mysterious, deep thinker 🌙', 'D. The organised, go-getter 🚀'],
  },
  {
    q: 'What motivates you most?',
    opts: ['A. Recognition and attention 🌟', 'B. Meaningful connections and love ❤️', 'C. Freedom and self-discovery 🌿', 'D. Achieving goals and leaving a legacy 🏆'],
  },
];

const RESULTS = {
  A: {
    type: '🌟 The Social Spark',
    desc: 'You\'re magnetic, energetic, and the glue of every group. You thrive on attention and human connection. People love being around you.',
    strengths: 'Charisma, Communication, Positivity',
    weakness: 'Can spread yourself too thin',
    celeb: 'Will Smith / Beyoncé',
  },
  B: {
    type: '💛 The Loyal Heart',
    desc: 'Deep, caring, and fiercely loyal. You value real connections over popularity. You\'d take a bullet for your inner circle.',
    strengths: 'Empathy, Trustworthiness, Emotional Intelligence',
    weakness: 'Sometimes too self-sacrificing',
    celeb: 'Oprah Winfrey / Keanu Reeves',
  },
  C: {
    type: '🌙 The Deep Thinker',
    desc: 'Introspective, creative, and quietly brilliant. You\'re ahead of your time but prefer to work from the shadows.',
    strengths: 'Creativity, Independence, Depth',
    weakness: 'Can seem distant or hard to read',
    celeb: 'Einstein / Billie Eilish',
  },
  D: {
    type: '🚀 The Driven Builder',
    desc: 'Ambitious, organised, and unstoppable. You see problems as puzzles and opportunities everywhere. Born to build.',
    strengths: 'Leadership, Focus, Execution',
    weakness: 'Can overlook feelings in pursuit of goals',
    celeb: 'Elon Musk / Serena Williams',
  },
};

// sessions: sender → { step, answers }
const sessions = new Map();

module.exports = {
  name: 'personality',
  aliases: ['personalitytest', 'mytype', 'mbti'],
  description: '🧠 Quick personality test — 5 questions, instant result',
  category: 'fun',

  execute: async ({ sender, args, reply }) => {
    const input = (args[0] || '').toUpperCase();

    const s = sessions.get(sender);

    // No active session → start
    if (!s) {
      sessions.set(sender, { step: 0, answers: [] });
      const q = QUIZ[0];
      return reply(
        `🧠 *Personality Test*\n\nAnswer 5 quick questions honestly!\n\n` +
        `*Question 1 of 5:*\n${q.q}\n\n` +
        q.opts.join('\n') +
        `\n\nReply: *.personality A/B/C/D*`
      );
    }

    if (!['A','B','C','D'].includes(input)) {
      const q = QUIZ[s.step];
      return reply(
        `🧠 *Question ${s.step + 1} of 5:*\n${q.q}\n\n` +
        q.opts.join('\n') +
        `\n\nReply: *.personality A/B/C/D*`
      );
    }

    s.answers.push(input);
    s.step++;

    if (s.step < QUIZ.length) {
      sessions.set(sender, s);
      const q = QUIZ[s.step];
      return reply(
        `✅ Got it!\n\n*Question ${s.step + 1} of 5:*\n${q.q}\n\n` +
        q.opts.join('\n') +
        `\n\nReply: *.personality A/B/C/D*`
      );
    }

    // Done — calculate result
    sessions.delete(sender);
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    s.answers.forEach(a => counts[a]++);
    const type = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
    const r = RESULTS[type];

    return reply(
      `🧠 *Personality Test Result*\n\n` +
      `╔══════════════════════╗\n` +
      `   ${r.type}\n` +
      `╚══════════════════════╝\n\n` +
      `📖 ${r.desc}\n\n` +
      `💪 *Strengths:* ${r.strengths}\n` +
      `⚠️ *Watch out for:* ${r.weakness}\n` +
      `🌟 *You remind us of:* ${r.celeb}\n\n` +
      `Take it again: *.personality*`
    );
  },
};
