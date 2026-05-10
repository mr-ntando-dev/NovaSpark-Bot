/**
 * ⚡ NovaSpark Bot — Emoji Reaction Poll (FREE, no API)
 * .poll3 "Question?" "Option A" "Option B" "Option C"
 * Members react with 1️⃣ 2️⃣ 3️⃣ etc.
 * .pollresult <message_id> — show results
 */
'use strict';

const EMOJI_NUMS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

module.exports = {
  name:    'poll3',
  aliases: ['epoll', 'emojipolll', 'quickpoll'],
  category: 'tools',
  desc:    'Create an emoji-reaction poll (up to 8 options)',
  usage:   '.poll3 "Question?" "Option A" "Option B" ...',
  example: '.poll3 "Favourite fruit?" "🍎 Apple" "🍌 Banana" "🍇 Grapes"',
  async execute({ sock, msg, args, from }) {
    const full    = args.join(' ');
    const matches = full.match(/[""]([^""]+)[""]/g);
    if (!matches || matches.length < 3) {
      return sock.sendMessage(from, {
        text: '❌ Usage: `.poll3 "Question?" "Option A" "Option B" ...`\n\nAt least 2 options required (max 8).',
      }, { quoted: msg });
    }

    const question = matches[0].replace(/[""`]/g, '').trim();
    const options  = matches.slice(1, 9).map(m => m.replace(/[""`]/g, '').trim());

    let text = `📊 *${question}*\n\nReact with the emoji to vote:\n\n`;
    options.forEach((opt, i) => {
      text += `${EMOJI_NUMS[i]} ${opt}\n`;
    });
    text += `\n_Vote by reacting • Powered by NovaSpark Bot v11_`;

    await sock.sendMessage(from, { text }, { quoted: msg });
  },
};
