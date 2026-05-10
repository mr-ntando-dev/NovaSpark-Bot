/**
 * ⚡ NovaSpark Bot — Number Trivia (uses numbersapi.com — FREE, no key)
 * .numtrivia [number]       — fact about a number
 * .numtrivia year [year]    — historical year fact
 * .numtrivia math [number]  — math fact
 * .numtrivia date MM/DD     — historical date fact
 */
'use strict';

const http = require('http');

function fetchFact(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => resolve(data.trim()));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

module.exports = {
  name:    'numtrivia',
  aliases: ['numberfact2', 'numfact', 'nfact'],
  category: 'games',
  desc:    'Get fascinating facts about numbers, years, and dates',
  usage:   '.numtrivia [number] | .numtrivia year [year] | .numtrivia math [number] | .numtrivia date MM/DD',
  example: '.numtrivia 42\n.numtrivia year 1969\n.numtrivia math 12\n.numtrivia date 07/20',
  async execute({ sock, msg, args, from }) {
    const sub = (args[0] || '').toLowerCase();
    let url, label;

    if (sub === 'year') {
      const y = args[1] ? parseInt(args[1]) : new Date().getFullYear();
      url   = `http://numbersapi.com/${y}/year`;
      label = `📅 *Year Fact — ${y}*`;
    } else if (sub === 'math') {
      const n = args[1] ? parseInt(args[1]) : Math.floor(Math.random() * 100);
      url   = `http://numbersapi.com/${n}/math`;
      label = `📐 *Math Fact — ${n}*`;
    } else if (sub === 'date') {
      const d = args[1] || '1/1';
      url   = `http://numbersapi.com/${d}/date`;
      label = `🗓️ *Date Fact — ${d}*`;
    } else {
      const n = args[0] ? parseInt(args[0]) : Math.floor(Math.random() * 1000);
      url   = `http://numbersapi.com/${isNaN(n) ? 'random' : n}/trivia`;
      label = `🔢 *Number Fact — ${isNaN(n) ? 'Random' : n}*`;
    }

    try {
      const fact = await fetchFact(url);
      await sock.sendMessage(from, {
        text: `${label}\n\n${fact}\n\n_Powered by NovaSpark Bot v11_`,
      }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, {
        text: `❌ Failed to fetch fact: ${e.message}`,
      }, { quoted: msg });
    }
  },
};
