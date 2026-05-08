/**
 * ⚡ NovaSpark Bot — Command Usage Stats
 * .cmdstats  — shows top used commands across all chats
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');
const config   = require('../../config');

module.exports = {
  name: 'cmdstats',
  aliases: ['commandstats', 'topcmds', 'usage'],
  category: 'owner',
  description: 'Show the most-used commands across all chats',
  usage: '.cmdstats [top <n>]',
  ownerOnly: true,

  async execute({ args, reply, sock, from, msg }) {
    const db    = database.get ? database.get('cmdUsage') : {};
    const usage = (db && typeof db === 'object') ? db : {};

    if (!Object.keys(usage).length) {
      return reply(
        '📊 *Command Stats*\n\n' +
        'No command usage recorded yet.\n\n' +
        '_Stats are tracked automatically once commands are used._'
      );
    }

    const top   = parseInt(args[1] || args[0] || '15', 10) || 15;
    const sorted = Object.entries(usage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, top);

    const maxCount = sorted[0]?.[1] || 1;
    const lines    = sorted.map(([cmd, count], i) => {
      const bar  = '█'.repeat(Math.round(count / maxCount * 8)) + '░'.repeat(8 - Math.round(count / maxCount * 8));
      const pct  = Math.round(count / maxCount * 100);
      return `${(i + 1).toString().padStart(2, '0')}. ${config.prefix}${cmd.padEnd(16)} [${bar}] ${count}x`;
    });

    return reply(
      `📊 *Top ${top} Commands*\n\n` +
      `\`\`\`\n${lines.join('\n')}\n\`\`\`\n\n` +
      `Total tracked commands: *${Object.keys(usage).length}*`
    );
  },
};
