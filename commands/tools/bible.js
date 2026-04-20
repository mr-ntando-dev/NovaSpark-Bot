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

// Popular verses — format: "Book Chapter:Verse" (spaces, not slashes)
const POPULAR_VERSES = [
  'john 3:16',
  'psalm 23:1',
  'romans 8:28',
  'philippians 4:13',
  'jeremiah 29:11',
  'proverbs 3:5',
  'isaiah 40:31',
  'matthew 6:33',
  'joshua 1:9',
  'psalm 46:1',
  'romans 10:9',
  'john 14:6',
  'genesis 1:1',
  'psalm 91:1',
  'romans 3:23',
  'hebrews 11:1',
  '1 corinthians 13:4',
  'ephesians 2:8',
  'revelation 21:4',
  'john 15:13',
  'psalm 119:105',
  'isaiah 41:10',
  'micah 6:8',
  'luke 1:37',
  'matthew 5:16',
  'psalm 46:10',
  'john 11:25',
  'romans 5:8',
  'james 1:17',
  'proverbs 18:10',
];

async function fetchVerse(reference) {
  // bible-api.com requires spaces encoded as %20 (not slashes, not +)
  const encoded = encodeURIComponent(reference.trim());
  const r = await axios.get(
    'https://bible-api.com/' + encoded + '?translation=kjv',
    { timeout: 12000, headers: { 'User-Agent': 'NovaSpark-Bot/5.0' } }
  );
  if (!r.data || !r.data.text) throw new Error('Verse not found');
  return {
    reference: r.data.reference || reference,
    text: r.data.text.trim().replace(/\s+/g, ' '),
    translation: r.data.translation_name || 'King James Version',
  };
}

module.exports = {
  name: 'bible',
  aliases: ['verse', 'scripture', 'bibleverse', 'kjv'],
  category: 'tools',
  description: 'Get Bible verses — random, specific, or keyword search',
  usage: '.bible | .bible John 3:16 | .bible search love',

  async execute({ sock, msg, from, args, reply }) {
    await sock.sendMessage(from, { react: { text: '📖', key: msg.key } });

    const input = args.join(' ').trim();

    try {
      let verseData;
      let searchMode = false;

      if (!input) {
        // ── Random popular verse ─────────────────────────────────────────
        const random = POPULAR_VERSES[Math.floor(Math.random() * POPULAR_VERSES.length)];
        verseData = await fetchVerse(random);

      } else if (input.toLowerCase().startsWith('search ')) {
        // ── Keyword search ───────────────────────────────────────────────
        const keyword = input.slice(7).trim();
        if (!keyword) return reply('📖 Usage: _.bible search hope_');
        searchMode = true;
        try {
          verseData = await fetchVerse(keyword);
        } catch {
          // If keyword search fails, pick a random verse and note it
          const random = POPULAR_VERSES[Math.floor(Math.random() * POPULAR_VERSES.length)];
          verseData = await fetchVerse(random);
          await sock.sendMessage(from, {
            text:
              '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
              '  📖 *HOLY BIBLE — KJV*\n' +
              '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
              '🔍 Search: _"' + keyword + '"_ — no exact match found\n' +
              '_Here\'s a related verse instead:_\n\n' +
              '📜 *' + verseData.reference + '*\n\n' +
              '"' + verseData.text + '"\n\n' +
              '━'.repeat(30) + '\n' +
              '📚 ' + verseData.translation + '\n\n' +
              '💡 _Try: .bible Psalm 119:105 or .bible Romans 8:28_\n\n' +
              '_⚡ NovaSpark Bot — Dev-Ntando_',
          }, { quoted: msg });
          return;
        }

      } else {
        // ── Specific verse ───────────────────────────────────────────────
        verseData = await fetchVerse(input);
      }

      // ── Send verse card ──────────────────────────────────────────────────
      const header = searchMode
        ? '🔍 *Search: "' + input.slice(7) + '"*\n\n'
        : '';

      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  📖 *HOLY BIBLE — KJV*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          header +
          '📜 *' + verseData.reference + '*\n\n' +
          '"' + verseData.text + '"\n\n' +
          '━'.repeat(30) + '\n' +
          '📚 ' + verseData.translation + '\n\n' +
          '💡 *More commands:*\n' +
          '• .bible — Random verse\n' +
          '• .bible John 3:16 — Specific verse\n' +
          '• .bible Psalm 23 — Full chapter verse\n' +
          '• .bible search hope — Keyword\n\n' +
          '_⚡ NovaSpark Bot — Dev-Ntando_',
      }, { quoted: msg });

    } catch (e) {
      // Friendly error with example format
      await sock.sendMessage(from, {
        text:
          '╭━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '  📖 *HOLY BIBLE — KJV*\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
          '❌ Verse not found: _"' + (input || 'random') + '"_\n\n' +
          '💡 *Correct formats:*\n' +
          '• .bible John 3:16\n' +
          '• .bible Psalm 23\n' +
          '• .bible Romans 8:28\n' +
          '• .bible search love\n' +
          '• .bible _(no args = random verse)_',
      }, { quoted: msg });
    }
  },
};
