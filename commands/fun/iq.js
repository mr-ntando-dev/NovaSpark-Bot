/**
 * ⚡ NovaSpark Bot — IQ Test (fun, not real!)
 * .iq [@user]  — gives a funny IQ score
 */
'use strict';

function funnyIQ(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  // Range 40-200 for comedy
  return 40 + Math.abs(hash % 161);
}

function iqComment(score) {
  if (score >= 180) return '🧠 GALAXY BRAIN. You\'re basically a supercomputer.';
  if (score >= 150) return '🏆 Genius tier. You probably solve Rubik\'s cubes blindfolded.';
  if (score >= 130) return '📚 Very smart. Wikipedia articles reference *you*.';
  if (score >= 110) return '✅ Above average. You actually read terms & conditions.';
  if (score >= 90)  return '😊 Normal. You know when to add the "😂" emoji.';
  if (score >= 70)  return '😅 A little below average. You reply "k" to paragraphs.';
  if (score >= 55)  return '🤡 Yikes. You type in all caps in group chats.';
  return '🪨 Rocks called. They want their IQ back.';
}

module.exports = {
  name:    'iq',
  aliases: ['iqtest', 'smartness'],
  category: 'fun',
  desc:    'Find out your (very scientific) IQ score 🧠',
  usage:   '.iq [@user or name]',
  example: '.iq @John',
  async execute({ sock, msg, args, from, sender }) {
    const target = args.length
      ? args.join(' ').replace('@', '').trim()
      : (sender || 'user').split('@')[0];

    const score   = funnyIQ(target.toLowerCase());
    const comment = iqComment(score);

    await sock.sendMessage(from, {
      text: `🧠 *IQ Test Results*\n\n` +
            `*${target}\'s IQ:* ${score}\n\n` +
            `${comment}\n\n` +
            `_⚠️ For entertainment only — NovaSpark Bot v11_`,
    }, { quoted: msg });
  },
};
