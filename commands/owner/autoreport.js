/**
 * ⚡ NovaSpark v9 — Auto Daily Report
 * .autoreport on — Enable daily 6AM group stats summary
 * .autoreport off — Disable
 * .autoreport now — Send report immediately
 * Sends: top chatters, message count, commands used, active features.
 * Owner only.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const config   = require('../../config');

let reportInterval = null;
let botSocket = null;

function buildReport(gid) {
  const gs = database.getGroupSettings ? database.getGroupSettings(gid) : {};
  const stats = database.getGroupStats ? database.getGroupStats(gid) : {};
  const uptime = process.uptime();
  const hrs  = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const topChatters = stats.topChatters || [];
  const totalMsgs = stats.totalMessages || 0;
  const cmdsUsed  = stats.commandsRun   || 0;

  const features = [
    gs.antiLink    ? '🔗 AntiLink'   : null,
    gs.antiToxic   ? '🧠 AntiToxic'  : null,
    gs.nightMode   ? '🌙 NightMode'  : null,
    gs.vipOnly     ? '⭐ VIP Mode'   : null,
    gs.ghost       ? '👻 Ghost Mode' : null,
    gs.welcome     ? '👋 Welcome'    : null,
    gs.slowMode    ? '🐢 SlowMode'   : null,
  ].filter(Boolean);

  const topLines = topChatters.slice(0, 5).map((c, i) =>
    `${i + 1}. @${c.jid.split('@')[0]} — ${c.count} msgs`
  );

  const now = new Date().toLocaleString('en-ZA', {
    timeZone: config.timezone || 'Africa/Harare',
    dateStyle: 'medium', timeStyle: 'short',
  });

  return (
    `📊 *NovaSpark Daily Report*\n` +
    `🕐 ${now}\n\n` +
    `💬 Messages today: *${totalMsgs}*\n` +
    `⚡ Commands run: *${cmdsUsed}*\n` +
    `⏱️ Uptime: *${hrs}h ${mins}m*\n\n` +
    (topLines.length ? `👑 *Top Chatters:*\n${topLines.join('\n')}\n\n` : '') +
    (features.length ? `🛡️ *Active Features:*\n${features.join(' | ')}\n` : '') +
    `\n_NovaSpark Bot v${config.botVersion}_`
  );
}

module.exports = {
  name: 'autoreport',
  aliases: ['dailyreport', 'dailystats'],
  description: '📊 Auto daily group stats report',
  category: 'owner',
  ownerOnly: true,

  init: (sock) => {
    botSocket = sock;
  },

  execute: async ({ sock, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');
    const sub = (args[0] || '').toLowerCase();
    botSocket = sock;

    if (sub === 'off') {
      const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
      database.updateGroupSettings && database.updateGroupSettings(from, { autoReport: false });
      if (reportInterval) { clearInterval(reportInterval); reportInterval = null; }
      return reply('📊 Auto Daily Report: *OFF*');
    }

    if (sub === 'now') {
      const report = buildReport(from);
      return reply(report);
    }

    if (sub === 'on') {
      database.updateGroupSettings && database.updateGroupSettings(from, { autoReport: true, autoReportChat: from });
      // Schedule check every minute — fire at 6:00 AM local time
      if (!reportInterval) {
        reportInterval = setInterval(async () => {
          const now = new Date().toLocaleString('en-ZA', { timeZone: config.timezone || 'Africa/Harare', hour12: false });
          const time = now.split(', ')[1];
          if (time && time.startsWith('06:00')) {
            try {
              const allGroups = database.getAllGroupSettings ? database.getAllGroupSettings() : {};
              for (const [gid, gs] of Object.entries(allGroups)) {
                if (gs.autoReport && botSocket) {
                  const report = buildReport(gid);
                  await botSocket.sendMessage(gid, { text: report });
                }
              }
            } catch {}
          }
        }, 60000);
      }
      return reply('📊 Auto Daily Report: *ON* ✅\nReport will be sent at *6:00 AM* every day.\n\n*.autoreport now* — Send immediately.');
    }

    const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
    return reply(
      `📊 *Auto Daily Report*\n\nStatus: *${gs.autoReport ? 'ON ✅' : 'OFF ❌'}*\n\n` +
      '*.autoreport on* — Enable 6AM daily stats\n' +
      '*.autoreport off* — Disable\n' +
      '*.autoreport now* — Send report now'
    );
  },
};
