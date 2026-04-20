/**
 * ⚡ NovaSpark Bot — Dictionary
 * .define <word> — proper dictionary definition with pronunciation, parts of speech, examples
 * Uses Free Dictionary API (no key required)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'define',
  aliases: ['dict', 'dictionary', 'meaning', 'definition'],
  category: 'tools',
  description: 'Look up any word in the dictionary',
  usage: '.define <word>',

  async execute({ args, reply }) {
    const word = args.join(' ').trim().toLowerCase();
    if (!word) return reply('📖 Usage: *.define <word>*\n\nExample: `.define serendipity`');

    try {
      const { data } = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
        { timeout: 8000 }
      );

      const entry    = data[0];
      const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
      const meanings = entry.meanings?.slice(0, 3) || [];

      let text = `📖 *${entry.word}*`;
      if (phonetic) text += `  _${phonetic}_`;
      text += '\n\n';

      for (const m of meanings) {
        text += `*${m.partOfSpeech.toUpperCase()}*\n`;
        const defs = m.definitions.slice(0, 2);
        for (const d of defs) {
          text += `  • ${d.definition}\n`;
          if (d.example) text += `    _"${d.example}"_\n`;
        }
        if (m.synonyms?.length) {
          text += `  Synonyms: ${m.synonyms.slice(0, 5).join(', ')}\n`;
        }
        text += '\n';
      }

      text += `_Source: Free Dictionary API_`;
      return reply(text);
    } catch (e) {
      if (e.response?.status === 404) return reply(`❌ "*${word}*" not found in the dictionary.\nCheck the spelling and try again.`);
      return reply(`❌ Could not fetch definition right now. Try again!`);
    }
  },
};
