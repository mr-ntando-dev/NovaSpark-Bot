/**
 * ⚡ NovaSpark Bot — Love Meter (no API needed)
 * .love @user1 @user2  or  .love Name1 Name2
 */
'use strict';

function loveMeter(a, b) {
  // Deterministic but fun — hash both names together
  const combined = (a + b).toLowerCase().split('').sort().join('');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 101); // 0-100
}

function loveBar(percent) {
  const filled = Math.round(percent / 10);
  return '❤️'.repeat(filled) + '🖤'.repeat(10 - filled);
}

function loveComment(percent) {
  if (percent >= 90) return '🔥 SOULMATES! You two are made for each other!';
  if (percent >= 75) return '💕 Great match! The chemistry is undeniable!';
  if (percent >= 60) return '😍 A solid connection — definitely worth exploring!';
  if (percent >= 45) return '😊 There\'s something there… sparks could fly!';
  if (percent >= 30) return '🤔 It\'s complicated. But love is a journey!';
  if (percent >= 15) return '😅 Hmm… opposites attract, right?';
  return '💀 Yikes. Maybe just stay friends…';
}

module.exports = {
  name:    'love',
  aliases: ['lovemeter', 'lovelevel', 'lovescore'],
  category: 'fun',
  desc:    'Calculate love compatibility between two names or users',
  usage:   '.love @user1 @user2  OR  .love Name1 Name2',
  example: '.love @Alice @Bob',
  async execute({ sock, msg, args, from }) {
    const parts = args.filter(a => a.trim());
    if (parts.length < 2) {
      return sock.sendMessage(from, {
        text: '❌ Provide two names or mentions.\nUsage: `.love @Alice @Bob`',
      }, { quoted: msg });
    }

    const name1 = parts[0].replace('@', '').trim();
    const name2 = parts.slice(1).join(' ').replace('@', '').trim();

    const percent = loveMeter(name1, name2);
    const bar     = loveBar(percent);
    const comment = loveComment(percent);

    await sock.sendMessage(from, {
      text: `💘 *Love Meter*\n\n` +
            `*${name1}* ❤️ *${name2}*\n\n` +
            `${bar}\n\n` +
            `*Love Score:* ${percent}%\n\n` +
            `${comment}\n\n` +
            `_Powered by NovaSpark Bot v11_`,
    }, { quoted: msg });
  },
};
