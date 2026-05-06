/**
 * ⚡ NovaSpark Bot v11 — .autoquiz
 * Schedule automatic daily trivia quizzes in a group at a set time.
 * Uses Open Trivia DB (no API key). Tracks scores per group.
 * Admin only to configure. Everyone can answer.
 * By Dev-Ntando
 */
'use strict';
const https    = require('https');
const config   = require('../../config');
const database = require('../../database');

const QUIZ_KEY   = '__autoquiz_groups';   // settings key
const SCORES_KEY = '__autoquiz_scores';   // scores key
const ACTIVE_KEY = '__autoquiz_active';   // active question state

// ── Fetch question from Open Trivia DB ────────────────────────────────────────
function fetchQuestion(category = '') {
  const catParam = category ? `&category=${category}` : '';
  const apiUrl   = `https://opentdb.com/api.php?amount=1&type=multiple${catParam}&encode=url3986`;
  return new Promise((resolve, reject) => {
    https.get(apiUrl, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.response_code !== 0) return reject(new Error('No questions available'));
          const q = j.results[0];
          const correct   = decodeURIComponent(q.correct_answer);
          const incorrect = q.incorrect_answers.map(a => decodeURIComponent(a));
          const all       = [...incorrect, correct].sort(() => Math.random() - 0.5);
          const labels    = ['A', 'B', 'C', 'D'];
          const options   = all.map((a, i) => ({ label: labels[i], text: a }));
          const ansLabel  = options.find(o => o.text === correct).label;
          resolve({
            question:  decodeURIComponent(q.question),
            options,
            answer:    ansLabel,
            answerText: correct,
            category:  decodeURIComponent(q.category),
            difficulty: q.difficulty,
          });
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── Format and send a quiz question ──────────────────────────────────────────
async function sendQuiz(sock, jid, category) {
  let q;
  try { q = await fetchQuestion(category); }
  catch { return; }

  const lines = [
    `🧠 *Daily Quiz Time!*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📚 Category: *${q.category}*`,
    `⚡ Difficulty: *${q.difficulty}*`,
    ``,
    `❓ *${q.question}*`,
    ``,
    ...q.options.map(o => `*${o.label}.* ${o.text}`),
    ``,
    `_Reply with A, B, C, or D. Answer in 60 seconds!_`,
  ];

  const sent = await sock.sendMessage(jid, { text: lines.join('\n') });

  // Store active quiz for this group
  const active = database.getSetting(ACTIVE_KEY) || {};
  active[jid] = {
    answer:     q.answerText,
    answerLabel: q.answer,
    expiresAt:  Date.now() + 60_000,
    msgId:      sent?.key?.id || null,
    answered:   [],
  };
  database.setSetting(ACTIVE_KEY, active);

  // Auto-reveal after 60s
  setTimeout(async () => {
    const cur = (database.getSetting(ACTIVE_KEY) || {})[jid];
    if (!cur || cur.answered.length > 0) return; // already answered
    await sock.sendMessage(jid, {
      text: `⏰ *Time's up!*\n\nThe correct answer was: *${q.answer}. ${q.answerText}*\n\nNobody got it this time!`,
    });
    const a2 = database.getSetting(ACTIVE_KEY) || {};
    delete a2[jid];
    database.setSetting(ACTIVE_KEY, a2);
  }, 60_000);
}

// ── Handle answer attempts (call from handler.js message pipeline) ─────────────
async function handleAnswer(sock, msg, from, sender, body) {
  const active = database.getSetting(ACTIVE_KEY) || {};
  const quiz   = active[from];
  if (!quiz) return false;
  if (Date.now() > quiz.expiresAt) return false;
  if (quiz.answered.includes(sender)) return false;

  const ans = body.trim().toUpperCase().slice(0, 1);
  if (!['A','B','C','D'].includes(ans)) return false;

  quiz.answered.push(sender);

  if (ans === quiz.answerLabel) {
    // Correct — update scores
    const scores = database.getSetting(SCORES_KEY) || {};
    if (!scores[from]) scores[from] = {};
    const num = sender.split('@')[0];
    scores[from][num] = (scores[from][num] || 0) + 1;
    database.setSetting(SCORES_KEY, scores);

    await sock.sendMessage(from, {
      text: `🎉 *Correct!* @${num} got it right!\nAnswer: *${quiz.answerLabel}. ${quiz.answer}*\n\n🏆 Score: *${scores[from][num]} pts*`,
      mentions: [sender],
    });

    // Clear active quiz
    delete active[from];
    database.setSetting(ACTIVE_KEY, active);
    return true;
  } else {
    await sock.sendMessage(from, {
      text: `❌ *Wrong!* @${sender.split('@')[0]} — keep trying!\n_Correct answer will be revealed at timeout._`,
      mentions: [sender],
    });
    return true;
  }
}
module.exports.handleAnswer = handleAnswer;

// ── Daily quiz scheduler ─────────────────────────────────────────────────────
let _schedulerRunning = false;
function startScheduler(sock) {
  if (_schedulerRunning) return;
  _schedulerRunning = true;

  function tick() {
    const tz  = config.timezone || 'Africa/Harare';
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const groups = database.getSetting(QUIZ_KEY) || {};
    for (const [jid, cfg] of Object.entries(groups)) {
      if (cfg.enabled && cfg.time === hhmm) {
        sendQuiz(sock, jid, cfg.category || '').catch(() => {});
      }
    }
    setTimeout(tick, 60_000); // check every minute
  }
  setTimeout(tick, (60 - new Date().getSeconds()) * 1000); // align to next minute
}
module.exports.startScheduler = startScheduler;

// ── Command ───────────────────────────────────────────────────────────────────
module.exports = {
  name:        'autoquiz',
  aliases:     ['dailyquiz', 'schedulequiz', 'quizmode'],
  category:    'group',
  description: 'Schedule automatic daily trivia quizzes in this group',
  usage:       '.autoquiz on 08:00  |  .autoquiz off  |  .autoquiz scores  |  .autoquiz now',
  adminOnly:   true,

  execute: async ({ sock, msg, from, args, reply, isAdmin }) => {
    if (!from.endsWith('@g.us')) return reply('⚠️ This command is for groups only.');

    startScheduler(sock); // boot scheduler on first use

    const sub  = (args[0] || '').toLowerCase();
    const groups = database.getSetting(QUIZ_KEY) || {};
    const cfg    = groups[from] || { enabled: false, time: '08:00', category: '' };

    if (!sub || sub === 'status') {
      const scores = database.getSetting(SCORES_KEY)?.[from] || {};
      const top    = Object.entries(scores).sort((a,b) => b[1]-a[1]).slice(0,5);
      return reply([
        `🧠 *Auto Quiz*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `Status: ${cfg.enabled ? '✅ *ON*' : '❌ *OFF*'}`,
        `Time:   *${cfg.time}*`,
        `Category: *${cfg.category || 'Random'}*`,
        ``,
        top.length ? `🏆 *Top ${top.length} scores:*\n${top.map(([n,s],i)=>`${i+1}. +${n} — ${s} pts`).join('\n')}` : '',
        ``,
        `*Commands:*`,
        `  \`.autoquiz on 08:00\` — enable daily quiz`,
        `  \`.autoquiz off\` — disable`,
        `  \`.autoquiz now\` — send one now`,
        `  \`.autoquiz scores\` — view leaderboard`,
        `  \`.autoquiz resetscores\` — clear scores`,
      ].join('\n'));
    }

    if (sub === 'on') {
      const time = args[1] || cfg.time;
      if (!/^\d{1,2}:\d{2}$/.test(time)) return reply('Usage: `.autoquiz on HH:MM` e.g. `.autoquiz on 08:00`');
      const padded = time.padStart(5, '0');
      groups[from] = { ...cfg, enabled: true, time: padded };
      database.setSetting(QUIZ_KEY, groups);
      return reply(`✅ *Auto Quiz enabled!*\nA trivia question will be posted daily at *${padded}* (${config.timezone || 'Africa/Harare'}).`);
    }

    if (sub === 'off') {
      groups[from] = { ...cfg, enabled: false };
      database.setSetting(QUIZ_KEY, groups);
      return reply('❌ Auto Quiz *disabled*.');
    }

    if (sub === 'now') {
      await reply('🧠 Sending a quiz question now...');
      await sendQuiz(sock, from, cfg.category);
      return;
    }

    if (sub === 'scores') {
      const scores = database.getSetting(SCORES_KEY)?.[from] || {};
      const top    = Object.entries(scores).sort((a,b) => b[1]-a[1]).slice(0,10);
      if (!top.length) return reply('📭 No quiz scores yet in this group.');
      return reply(`🏆 *Quiz Leaderboard*\n\n${top.map(([n,s],i)=>`${i+1}. +${n} — *${s} pts*`).join('\n')}`);
    }

    if (sub === 'resetscores') {
      const scores = database.getSetting(SCORES_KEY) || {};
      delete scores[from];
      database.setSetting(SCORES_KEY, scores);
      return reply('✅ Quiz scores reset for this group.');
    }

    return reply('Unknown sub-command. Try `.autoquiz status`');
  },
};
