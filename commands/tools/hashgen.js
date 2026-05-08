/**
 * ⚡ NovaSpark Bot — Hash Generator
 * .hash <algorithm> <text>  — supports md5, sha1, sha256, sha512
 * By Dev-Ntando
 */
'use strict';
const crypto = require('crypto');

const ALGOS = ['md5', 'sha1', 'sha256', 'sha512'];

module.exports = {
  name: 'hash',
  aliases: ['hashgen', 'checksum'],
  category: 'tools',
  description: 'Generate a cryptographic hash of any text',
  usage: '.hash sha256 <text>',

  async execute({ args, reply }) {
    const algo = (args[0] || '').toLowerCase();
    const text = args.slice(1).join(' ').trim();

    if (!algo || !text) {
      return reply(
        '🔐 *Hash Generator*\n\n' +
        'Usage: `.hash <algorithm> <text>`\n\n' +
        `Supported algorithms:\n${ALGOS.map(a => `  • ${a}`).join('\n')}\n\n` +
        'Example: `.hash sha256 hello world`'
      );
    }

    if (!ALGOS.includes(algo)) {
      return reply(`❌ Unknown algorithm *${algo}*\n\nSupported: ${ALGOS.join(', ')}`);
    }

    const hash = crypto.createHash(algo).update(text).digest('hex');
    return reply(
      `🔐 *${algo.toUpperCase()} Hash*\n\n` +
      `Input: \`${text}\`\n\n` +
      `\`\`\`${hash}\`\`\``
    );
  },
};
