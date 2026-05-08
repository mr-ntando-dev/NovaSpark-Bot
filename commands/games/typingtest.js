/**
 * ⚡ NovaSpark Bot — Typing Speed Test
 * .typingtest  — sends a prompt, user types it back, bot measures WPM
 * By Dev-Ntando
 */
'use strict';

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog near the riverbank.',
  'WhatsApp bots are built with JavaScript and Baileys library.',
  'Practice makes perfect and persistence is the key to success.',
  'Technology is best when it brings people together across distances.',
  'Every expert was once a beginner who refused to give up trying.',
  'The only way to do great work is to love what you do every day.',
  'Success is not final and failure is not fatal it is the courage to continue.',
  'In the middle of every difficulty lies a great opportunity for growth.',
  'Life is ten percent what happens to you and ninety percent how you react.',
  'The secret of getting ahead is getting started with small steps daily.',
];

const sessions = new Map();

module.exports = {
  name: 'typingtest',
  aliases: ['typetest', 'wpm', 'typespeed'],
  category: 'games',
  description: 'Test your typing speed — type a sentence to get your WPM score',
  usage: '.typingtest',

  async execute({ sock, msg, from, args, reply, sender, body }) {
    const key     = `${from}_${sender}`;
    const session = sessions.get(key);

    if (session) {
      const elapsed  = (Date.now() - session.startTime) / 1000;
      const typed    = body.trim();
      const original = session.sentence;

      clearTimeout(session.timer);
      sessions.delete(key);

      const origWords = original.split(' ');
      const typedWords = typed.split(' ');

      let correct = 0;
      typedWords.forEach((w, i) => { if (w === origWords[i]) correct++; });

      const wpm      = Math.round((typedWords.length / elapsed) * 60);
      const accuracy = Math.round((correct / origWords.length) * 100);

      let rating;
      if (wpm >= 80 && accuracy >= 95)     rating = '🏆 Professional Typist!';
      else if (wpm >= 60 && accuracy >= 90) rating = '🥇 Excellent!';
      else if (wpm >= 40 && accuracy >= 80) rating = '🥈 Good!';
      else if (wpm >= 20)                   rating = '🥉 Average — keep practising!';
      else                                  rating = '📚 Slow & steady — practice more!';

      return reply(
        `⌨️ *Typing Test Result*\n\n` +
        `⏱️ Time     : *${elapsed.toFixed(1)} seconds*\n` +
        `💨 Speed    : *${wpm} WPM*\n` +
        `🎯 Accuracy : *${accuracy}%* (${correct}/${origWords.length} words)\n\n` +
        `${rating}\n\n` +
        `_Type \`.typingtest\` to try again!_`
      );
    }

    // Start new test
    const sentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    const timer    = setTimeout(() => {
      sessions.delete(key);
      sock.sendMessage(from, { text: '⏰ *Time\'s up!* You took too long. Type `.typingtest` to start again.' }, { quoted: msg });
    }, 60000);

    sessions.set(key, { sentence, startTime: Date.now(), timer });

    return reply(
      `⌨️ *Typing Speed Test*\n\n` +
      `Type the following sentence *exactly* (punctuation matters!):\n\n` +
      `\`\`\`${sentence}\`\`\`\n\n` +
      `_Timer starts when you send your reply. You have 60 seconds!_`
    );
  },
};
