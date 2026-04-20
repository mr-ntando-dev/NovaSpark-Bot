/**
 * ⚡ NovaSpark v4 — Live Trivia
 * .trivia — Fetch a live trivia question from Open Trivia DB
 * .trivia answer A/B/C/D — Answer
 * Tracks score per user. NEVER SEEN before.
 * By Dev-Ntando
 */
'use strict';
const axios    = require('axios');
const database = require('../../database');

// In-memory: chatId+userId → { q, options, answer }
const pending = new Map();

function decode(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'é')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

module.exports = {
  name: 'trivia',
  aliases: ['quiz'],
  description: '🧠 Live trivia quiz — answer questions and track your score!',
  category: 'games',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const sub = (args[0] || '').toUpperCase().trim();
    const key  = `${from}:${sender}`;

    // Answer an existing question
    if (['A','B','C','D'].includes(sub)) {
      if (!pending.has(key)) return reply('❓ No active trivia question. Use `.trivia` to get one.');
      const { q, options, answer, category } = pending.get(key);
      pending.delete(key);
      const chosen = options[sub];
      const correct = sub === answer;
      // Update score
      const profile = database.getUserProfile ? database.getUserProfile(sender) : {};
      const score   = (profile.triviaScore || 0) + (correct ? 1 : 0);
      const total   = (profile.triviaTotal || 0) + 1;
      if (database.updateUserProfile) database.updateUserProfile(sender, { triviaScore: score, triviaTotal: total });

      return reply(
        `${correct ? '🎉 *Correct!*' : '❌ *Wrong!*'}\n\n` +
        `📖 *Q:* ${q}\n\n` +
        `✅ *Answer:* ${answer}. ${options[answer]}\n` +
        (correct ? '' : `❌ You chose: ${sub}. ${chosen}\n`) +
        `\n🏆 Score: *${score}/${total}* (${Math.round(score/total*100)}%)\n` +
        `_Next question: \`.trivia\`_`
      );
    }

    // Fetch a new question
    await reply('🧠 Fetching your trivia question...');
    try {
      const { data } = await axios.get(
        'https://opentdb.com/api.php?amount=1&type=multiple',
        { timeout: 8000 }
      );
      if (data.response_code !== 0) throw new Error('No results');
      const q = data.results[0];
      const correct   = decode(q.correct_answer);
      const allOpts   = [correct, ...q.incorrect_answers.map(decode)]
        .sort(() => Math.random() - 0.5);
      const letters   = ['A','B','C','D'];
      const optMap    = {};
      allOpts.forEach((o, i) => { optMap[letters[i]] = o; });
      const answerKey = Object.keys(optMap).find(k => optMap[k] === correct);
      pending.set(key, { q: decode(q.question), options: optMap, answer: answerKey, category: q.category });

      const optStr = letters.map(l => `  *${l}.* ${optMap[l]}`).join('\n');
      return reply(
        `🧠 *Trivia Question*\n` +
        `📂 ${q.category} | ⚡ ${q.difficulty.toUpperCase()}\n` +
        `${'─'.repeat(30)}\n\n` +
        `*${decode(q.question)}*\n\n` +
        `${optStr}\n\n` +
        `Reply: \`.trivia A\` / \`.trivia B\` / etc.\n_⏱ 30 seconds!_`
      );
    } catch (e) {
      return reply('❌ Could not fetch trivia question. Try again in a moment.');
    }
  },
};
