/**
 * ⚡ NovaSpark Bot v5 — Joke
 * Random joke from public API — setup / punchline style
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'joke',
  aliases: ['jokes', 'lol'],
  category: 'fun',
  description: 'Get a random joke',
  usage: '.joke',

  async execute(sock, msg, args, extra) {
    try {
      const { data } = await axios.get(
        'https://official-joke-api.appspot.com/jokes/random',
        { timeout: 8000 }
      );
      await extra.reply(`😂 *${data.setup}*\n\n🥁 ${data.punchline}`);
    } catch {
      // fallback local jokes
      const jokes = [
        { s: 'Why don\'t scientists trust atoms?', p: 'Because they make up everything! 😂' },
        { s: 'Why did the scarecrow win an award?', p: 'Because he was outstanding in his field! 🌾' },
        { s: 'What do you call a fake noodle?', p: 'An impasta! 🍝' },
        { s: 'Why can\'t you give Elsa a balloon?', p: 'Because she\'ll Let It Go! 🎈' },
        { s: 'How does a penguin build its house?', p: 'Igloos it together! 🐧' },
      ];
      const j = jokes[Math.floor(Math.random() * jokes.length)];
      await extra.reply(`😂 *${j.s}*\n\n🥁 ${j.p}`);
    }
  },
};
