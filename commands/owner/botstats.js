/**
 * ⚡ NovaSpark v4 — Bot Stats (Owner)
 * .botstats — Full server + usage stats dashboard
 * By Dev-Ntando
 */
'use strict';
const os       = require('os');
const database = require('../../database');
const config   = require('../../config');

module.exports = {
  name: 'botstats',
  aliases: ['stats', 'serverstats'],
  description: '📊 Full bot statistics — owner only',
  category: 'owner',
  ownerOnly: true,

  execute: async ({ sock, msg, from, reply }) => {
    const uptime  = process.uptime();
    const uptimeStr = `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${Math.floor(uptime%60)}s`;
    const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const memTotal= Math.round(os.totalmem() / 1024 / 1024);
    const memFree = Math.round(os.freemem()  / 1024 / 1024);
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const platform= os.platform();
    const nodeVer = process.version;

    const premium   = database.listPremium().length;
    const allGroups = database.getAllGroupSettings ? Object.keys(database.getAllGroupSettings()).length : 0;

    const botNum = sock.user?.id?.split(':')[0] || 'Unknown';

    return reply(
      `📊 *NovaSpark Bot v${config.botVersion} — Stats*\n` +
      `${'━'.repeat(35)}\n\n` +
      `🤖 *Bot:* ${config.botName}\n` +
      `📱 *Number:* +${botNum}\n` +
      `⚡ *Prefix:* ${config.prefix}\n` +
      `⏱️  *Uptime:* ${uptimeStr}\n\n` +
      `${'─'.repeat(30)}\n` +
      `💻 *Server*\n` +
      `  🖥️  Platform: ${platform}\n` +
      `  🔧 Node.js: ${nodeVer}\n` +
      `  💾 RAM: ${memUsed}MB used / ${memTotal}MB total\n` +
      `  🆓 Free RAM: ${memFree}MB\n` +
      `  📈 CPU Load: ${cpuLoad}\n\n` +
      `${'─'.repeat(30)}\n` +
      `📈 *Usage*\n` +
      `  💎 Premium users: ${premium}\n` +
      `  👥 Groups active: ${allGroups}\n\n` +
      `${'━'.repeat(35)}\n` +
      `_⚡ NovaSpark Bot v4 — 2026 Edition_`
    );
  },
};
