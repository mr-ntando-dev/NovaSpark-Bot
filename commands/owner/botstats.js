'use strict';
const database = require('../../database');
const os       = require('os');

module.exports = {
  name: 'botstats',
  aliases: ['botinfo', 'serverstats'],
  description: '[OWNER] View bot statistics and server info',
  category: 'owner',
  execute: async ({ isOwner, reply }) => {
    if (!isOwner) return reply('👑 Owner only.');
    const premiumCount = database.listPremium().length;
    const uptime       = process.uptime();
    const uptimeStr    = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
    const memUsed      = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const memTotal     = Math.round(os.totalmem() / 1024 / 1024);
    const platform     = os.platform();
    await reply(
      `📊 *NovaSpark Bot Stats*\n\n` +
      `💎 Premium Users : ${premiumCount}\n` +
      `⏱️  Uptime        : ${uptimeStr}\n` +
      `💾 Memory        : ${memUsed}MB used\n` +
      `🖥️  Platform      : ${platform}\n` +
      `🟢 Status        : Online\n\n` +
      `_NovaSpark Bot ⚡ by Dev-Ntando_`
    );
  },
};
