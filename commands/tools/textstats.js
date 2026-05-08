/**
 * ⚡ NovaSpark Bot — Text Statistics
 * .textstats <text>  — word count, char count, sentences, reading time, etc.
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'textstats',
  aliases: ['wordcount', 'charcount', 'textinfo'],
  category: 'tools',
  description: 'Analyse text — words, chars, sentences, reading time',
  usage: '.textstats <text>',

  async execute({ args, reply }) {
    const text = args.join(' ').trim();
    if (!text) return reply('📊 Usage: `.textstats <your text here>`');

    const chars      = text.length;
    const charsNoSp  = text.replace(/\s/g, '').length;
    const words      = text.trim().split(/\s+/).filter(Boolean).length;
    const sentences  = (text.match(/[.!?]+/g) || []).length || 1;
    const paragraphs = text.split(/\n{2,}/).filter(Boolean).length;
    const avgWordLen = words ? Math.round(charsNoSp / words * 10) / 10 : 0;
    const readSec    = Math.ceil(words / 200 * 60); // avg 200 wpm
    const readMin    = Math.floor(readSec / 60);
    const readRemSec = readSec % 60;
    const readTime   = readMin > 0 ? `${readMin}m ${readRemSec}s` : `${readRemSec}s`;

    // Most frequent word
    const freq = {};
    text.toLowerCase().split(/\s+/).forEach(w => {
      const clean = w.replace(/[^a-z]/g, '');
      if (clean.length > 2) freq[clean] = (freq[clean] || 0) + 1;
    });
    const topWord = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

    return reply(
      `📊 *Text Statistics*\n\n` +
      `📝 Characters     : *${chars}* (${charsNoSp} no spaces)\n` +
      `🔤 Words          : *${words}*\n` +
      `📖 Sentences      : *${sentences}*\n` +
      `📄 Paragraphs     : *${paragraphs}*\n` +
      `📏 Avg Word Len   : *${avgWordLen} chars*\n` +
      `⏱️  Reading Time   : *${readTime}* (200 wpm)\n` +
      (topWord ? `🏆 Top Word       : *"${topWord[0]}"* (${topWord[1]}x)` : '')
    );
  },
};
