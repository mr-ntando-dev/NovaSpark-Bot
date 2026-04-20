/**
 * ⚡ NovaSpark Bot v5 — Owner
 * Show bot owner contact info
 * Inspired by KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = {
  name: 'owner',
  aliases: ['creator', 'dev', 'developer'],
  category: 'tools',
  description: 'Show bot owner contact info',
  usage: '.owner',

  async execute(sock, msg, args, extra) {
    const owners  = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
    const names   = Array.isArray(config.ownerName)   ? config.ownerName   : [config.ownerName];
    const ownerJids = owners.map(n => `${n}@s.whatsapp.net`);

    let ownerList = '';
    owners.forEach((num, i) => {
      ownerList += `👑 *${names[i] || 'Owner'}* — wa.me/${num}\n`;
    });

    await sock.sendMessage(extra.from, {
      text:
        `╔════════════════════════╗\n` +
        `  👑 *NovaSpark Owners*  \n` +
        `╚════════════════════════╝\n\n` +
        ownerList + '\n' +
        `📦 Bot: *${config.botName} v${config.botVersion}*\n` +
        `📡 Channel: ${config.channelLink}`,
      mentions: ownerJids,
    }, { quoted: msg });
  },
};
