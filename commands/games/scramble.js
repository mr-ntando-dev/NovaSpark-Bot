/**
 * ⚡ NovaSpark v9 — Word Scramble Game
 * .scramble — Get a scrambled word, guess the original
 * .scramble <answer> — Submit your answer
 * .scramble hint — Get a hint
 * .scramble skip — Skip current word
 * Per-group sessions with scoring.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const WORDS = [
  'elephant','football','keyboard','dolphin','library','candle','diamond','mystery',
  'rainbow','volcano','tornado','galaxy','pyramid','journey','blanket','kingdom',
  'thunder','whisper','oxygen','harvest','compass','lantern','penguin','leopard',
  'sunrise','cottage','captain','fortune','monster','crystal','bamboo','mirror',
  'balloon','chicken','cabinet','century','comfort','curious','disease','dolphin',
  'economy','evening','factory','fashion','freedom','garden','gravity','history',
  'holiday','horizon','hundred','hunting','imagine','instead','kitchen','laughing',
  'machine','million','morning','natural','nothing','october','opinion','outside',
  'pattern','penguin','percent','perfect','picture','popular','present','problem',
  'program','protect','purpose','quickly','quietly','quarter','quarter','receive',
  'science','section','silence','similar','soldier','someone','special','station',
  'student','success','surface','teacher','thought','through','thunder','tonight',
  'towards','trouble','tonight','usually','village','walking','western','whether',
  'willing','without','working','writing','younger','chapter','counter','between',
];

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure scrambled != original
  return arr.join('') === word ? scramble(word) : arr.join('');
}

const sessions = new Map(); // groupId → { word, scrambled, hints, startTime }

module.exports = {
  name: 'scramble',
  aliases: ['wordscramble', 'unscramble'],
  description: '🔤 Word Scramble — Unscramble the word to win!',
  category: 'games',

  execute: async ({ from, sender, args, reply }) => {
    const input = args.join(' ').toLowerCase().trim();
    const s = sessions.get(from);

    // No sub → new word or show current
    if (!input || input === 'new') {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      const scrambled = scramble(word);
      sessions.set(from, { word, scrambled, hints: 0, startTime: Date.now() });
      return reply(
        `🔤 *Word Scramble!*\n\n` +
        `Unscramble this word:\n\n` +
        `*${scrambled.toUpperCase()}*\n\n` +
        `(${word.length} letters)\n\n` +
        `Reply with your answer, or:\n` +
        `*.scramble hint* — Get a hint (costs 1 pt)\n` +
        `*.scramble skip* — Skip word`
      );
    }

    if (!s) return reply('🔤 No active game! Type *.scramble* to start.');

    if (input === 'hint') {
      s.hints++;
      const revealed = s.word.split('').map((c, i) => i < s.hints ? c.toUpperCase() : '_').join(' ');
      sessions.set(from, s);
      return reply(`💡 Hint ${s.hints}: *${revealed}*\n\nScrambled: *${s.scrambled.toUpperCase()}*`);
    }

    if (input === 'skip') {
      const ans = s.word;
      sessions.delete(from);
      return reply(`⏭️ Skipped! The word was: *${ans.toUpperCase()}*\n\nNew game: *.scramble*`);
    }

    // Check answer
    if (input === s.word) {
      const timeTaken = Math.round((Date.now() - s.startTime) / 1000);
      const points = Math.max(1, 10 - s.hints * 2);
      sessions.delete(from);

      // Save score
      const profile = database.getUserProfile ? database.getUserProfile(sender) : {};
      const prevScore = profile.scrambleScore || 0;
      if (database.updateUserProfile) {
        database.updateUserProfile(sender, {
          scrambleScore: prevScore + points,
          scrambleWins: (profile.scrambleWins || 0) + 1,
        });
      }

      return reply(
        `✅ *Correct!* 🎉\n\n` +
        `The word was: *${s.word.toUpperCase()}*\n` +
        `⏱️ Time: ${timeTaken}s  •  🏆 +${points} points\n\n` +
        `New game: *.scramble*`
      );
    }

    // Wrong answer
    return reply(`❌ Nope! Try again.\nScrambled: *${s.scrambled.toUpperCase()}*\n\n*.scramble hint* for a clue.`);
  },
};
