/**
 * NovaSpark Bot v3 — Urban Dictionary Lookup
 * .urban <word>  — what does it actually mean in the real world
 * By Dev-Ntando
 */
'use strict';

const axios    = require('axios');
const database = require('../../database');

module.exports = {
  name: 'urban',
  aliases: ['ud', 'slang', 'urbandefine'],
  description: 'Look up any slang word on Urban Dictionary',
  category: 'free',

  execute: async ({ sock, from, sender, args, reply }) => {
    database.logCommand(sender, 'urban');

    const term = args.join(' ').trim();
    if (!term) {
      return reply(
        '📖 *Urban Dictionary*\n\n' +
        'Usage: *.urban <word>*\n\n' +
        'Examples:\n' +
        '  .urban slay\n' +
        '  .urban rizz\n' +
        '  .urban no cap'
      );
    }

    await sock.sendPresenceUpdate('composing', from);

    try {
      const { data } = await axios.get(
        `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`,
        { timeout: 10000 }
      );

      if (!data.list || data.list.length === 0) {
        return reply(`📖 No definition found for "*${term}*".\nMaybe you just invented a new word?`);
      }

      // Sort by thumbs_up and take top result
      const top = data.list.sort((a, b) => b.thumbs_up - a.thumbs_up)[0];

      const clean = (str) => str
        .replace(/\[|\]/g, '')  // remove UD's word-link brackets
        .trim()
        .slice(0, 600);          // cap at 600 chars

      const thumbsBar = `👍 ${top.thumbs_up.toLocaleString()}  👎 ${top.thumbs_down.toLocaleString()}`;

      const msg =
        `📖 *Urban Dictionary: ${term}*\n` +
        `${'─'.repeat(28)}\n\n` +
        `*Definition:*\n${clean(top.definition)}\n\n` +
        (top.example
          ? `*Example:*\n_${clean(top.example)}_\n\n`
          : '') +
        `${thumbsBar}\n\n` +
        `_Nova AI ⚡_`;

      await reply(msg);
    } catch (err) {
      console.error('[urban]', err.message);
      await reply('❌ Could not reach Urban Dictionary right now. Try again.');
    }
  },
};
