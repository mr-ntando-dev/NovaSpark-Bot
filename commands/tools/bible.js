/**
 * ⚡ NovaSpark Bot v5 — Bible Verse Command
 * .bible — random verse
 * .bible John 3:16 — specific verse
 * .bible search love — keyword search
 * Uses bible-api.com (free, no key needed)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const POPULAR_VERSES = [
  'john/3:16','psalm/23:1','romans/8:28','philippians/4:13','jeremiah/29:11',
  'proverbs/3:5','isaiah/40:31','matthew/6:33','joshua/1:9','psalm/46:1',
  'romans/10:9','john/14:6','genesis/1:1','psalm/91:1','john/11:35',
  'romans/3:23','hebrews/11:1','1corinthians/13:4','ephesians/2:8','revelation/21:4',
  'john/15:13','psalm/119:105','isaiah/41:10','micah/6:8','luke/1:37',
];

async function fetchVerse(reference) {
  const encoded = encodeURIComponent(reference);
  const r = await axios.get('https://bible-api.com/' + encoded + '?translation=kjv', { timeout: 10000 });
  if (!r.data || !r.data.text) throw new Error('Verse not found');
  return {
    reference: r.data.reference || reference,
    text: r.data.text.trim().replace(/\n/g, ' '),
    translation: r.data.translation_name || 'KJV',
  };
}

module.exports = {
  name: 'bible',
  aliases: ['verse', 'scripture', 'bibleverse', 'kjv'],
  category: 'tools',
  description: 'Get Bible verses — random, specific, or keyword search',
  usage: '.bible | .bible John 3:16 | .bible search <keyword>',

  async execute({ sock, msg, from, args, reply }) {
    await sock.sendMessage(from, { react: { text: '📖', key: msg.key } });

    const input = args.join(' ').trim();

    try {
      let verseData;

      if (!input) {
        // Random popular verse
        const random = POPULAR_VERSES[Math.floor(Math.random() * POPULAR_VERSES.length)];
        verseData = await fetchVerse(random);

      } else if (input.toLowerCase().startsWith('search ')) {
        // Keyword search
        const keyword = input.slice(7).trim();
        if (!keyword) return reply('📖 Usage: _.bible search love_');

        const r = await axios.get('https://bible-api.com/' + encodeURIComponent(keyword) + '?translation=kjv', { timeout: 10000 });
        if (!r.data || !r.data.text) {
          // Try a fallback random verse with a topical note
          const random = POPULAR_VERSES[Math.floor(Math.random() * POPULAR_VERSES.length)];
          verseData = await fetchVerse(random);
          await reply(
            '📖 *Bible — "' + keyword + '" Search*\n' +
            '━'.repeat(30) + '\n\n' +
            '_No exact match found. Here\'s a related verse:_\n\n' +
            '📜 *' + verseData.reference + '*\n\n' +
            '"' + verseData.text + '"\n\n' +
            '━'.repeat(30) + '\n' +
            '📚 ' + verseData.translation + ' | _⚡ NovaSpark Bot_'
          );
          return;
        }
        verseData = {
          reference: r.data.reference || keyword,
          text: r.data.text.trim().replace(/\n/g, ' '),
          translation: r.data.translation_name || 'KJV',
        };

      } else {
        // Specific verse — format: "John 3:16" or "Psalm 23"
        verseData = await fetchVerse(input);
      }

      // Beautiful verse card
      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  📖 *HOLY BIBLE — KJV*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          '📜 *' + verseData.reference + '*\n\n' +
          '"' + verseData.text + '"\n\n' +
          '━'.repeat(30) + '\n' +
          '📚 ' + verseData.translation + '\n\n' +
          '💡 _Commands:_\n' +
          '• .bible — Random verse\n' +
          '• .bible John 3:16 — Specific verse\n' +
          '• .bible search hope — Keyword search\n\n' +
          '_⚡ NovaSpark Bot — Dev-Ntando_',
      }, { quoted: msg });

    } catch (e) {
      await reply(
        '❌ *Bible Error*\n\n' +
        '• Input: _' + (input || 'random') + '_\n' +
        '• Error: ' + e.message + '\n\n' +
        '_Try: .bible John 3:16 or .bible Psalm 23_'
      );
    }
  },
};
