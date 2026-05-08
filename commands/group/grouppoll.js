/**
 * ⚡ NovaSpark Bot — Advanced Group Poll
 * .grouppoll <question> | <opt1> | <opt2> [| opt3...]
 * By Dev-Ntando
 */
'use strict';

const config = require('../../config');

module.exports = {
  name: 'grouppoll',
  aliases: ['gpoll', 'newpoll'],
  category: 'group',
  description: 'Create a multi-option WhatsApp native poll in the group',
  usage: '.grouppoll <question> | <option1> | <option2> [| option3...]',
  groupOnly: true,
  adminOnly: false,

  async execute({ sock, msg, from, args, reply }) {
    const full = args.join(' ').trim();
    if (!full.includes('|')) {
      return reply(
        '📊 *Group Poll*\n\n' +
        'Usage: `.grouppoll <question> | <option1> | <option2>`\n\n' +
        'Example:\n`.grouppoll Best language? | JavaScript | Python | TypeScript`\n\n' +
        '_You can add up to 12 options separated by ` | `_'
      );
    }

    const parts    = full.split('|').map(s => s.trim()).filter(Boolean);
    const question = parts[0];
    const options  = parts.slice(1);

    if (options.length < 2) return reply('❌ Please provide at least *2 options*.');
    if (options.length > 12) return reply('❌ Maximum *12 options* allowed.');

    await sock.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1,
      },
    }, { quoted: msg });
  },
};
