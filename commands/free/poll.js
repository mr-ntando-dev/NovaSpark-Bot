/**
 * NovaSpark Bot v3 — Native WhatsApp Poll Creator
 * .poll <question> | option1 | option2 | ...
 * Creates a real WhatsApp native poll (up to 12 options)
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

module.exports = {
  name: 'poll',
  aliases: ['vote', 'survey'],
  description: 'Create a native WhatsApp poll with up to 12 options',
  category: 'free',

  execute: async ({ sock, from, sender, args, msg, reply }) => {
    database.logCommand(sender, 'poll');

    const fullText = args.join(' ').trim();

    if (!fullText || !fullText.includes('|')) {
      return reply(
        '📊 *Poll Creator*\n\n' +
        'Usage: *.poll <question> | option1 | option2 | ...*\n\n' +
        'Examples:\n' +
        '  .poll Favourite language? | Python | JavaScript | TypeScript\n' +
        '  .poll Best phone? | iPhone | Samsung | Tecno | Other\n\n' +
        '_Minimum 2 options · Maximum 12 options_\n' +
        '_Works in both DMs and groups_'
      );
    }

    const parts    = fullText.split('|').map(p => p.trim()).filter(Boolean);
    const question = parts[0];
    const options  = parts.slice(1);

    if (!question) return reply('❌ Please provide a question before the `|`.');
    if (options.length < 2) return reply('❌ You need at least *2 options* separated by `|`.');
    if (options.length > 12) return reply('❌ Maximum *12 options* allowed.');

    // Deduplicate options (case-insensitive)
    const seen    = new Set();
    const unique  = options.filter(o => {
      const key = o.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (unique.length < 2) return reply('❌ Options must be unique.');

    try {
      // Baileys native poll message
      await sock.sendMessage(from, {
        poll: {
          name:          question,
          values:        unique,
          selectableCount: 1,
        },
      }, { quoted: msg });

    } catch (err) {
      console.error('[poll]', err.message);
      // If poll API not available on this Baileys version, send styled text fallback
      const optLines = unique.map((o, i) => `  ${['🅐','🅑','🅒','🅓','🅔','🅕','🅖','🅗','🅘','🅙','🅚','🅛'][i] || `${i+1}.`} ${o}`).join('\n');
      await reply(
        `📊 *Poll*\n\n` +
        `*${question}*\n\n` +
        `${optLines}\n\n` +
        `_Reply with the letter/number to vote! Votes tracked by NovaSpark._\n_Nova AI ⚡_`
      );
    }
  },
};
