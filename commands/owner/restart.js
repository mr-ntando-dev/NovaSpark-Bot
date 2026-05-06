/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .restart — Restart the bot process (Owner only)
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'reloadbot'],
  description: '🔄 Restart the bot process',
  category: 'owner',
  ownerOnly: true,

  execute: async ({ sock, from, msg, reply, sender }) => {
    const ownerNums = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
    const senderNum = sender.split('@')[0].split(':')[0];
    if (!ownerNums.map(String).includes(senderNum))
      return reply('🚫 Owner only command.');

    await reply('🔄 *NovaSpark Bot is restarting...*\n_Back in a few seconds. Hold tight! ⚡_');
    setTimeout(() => process.exit(0), 1500);
  },
};
