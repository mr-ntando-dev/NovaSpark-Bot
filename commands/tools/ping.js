/**
 * ⚡ NovaSpark Bot v5 — Ping
 * Show bot response latency, uptime & system stats
 * Inspired by Knightbot-MD & KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const os     = require('os');
const config = require('../../config');

function fmtUptime(s) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${sec}s`].filter(Boolean).join(' ');
}

module.exports = {
  name: 'ping',
  aliases: ['speed', 'latency', 'pong'],
  category: 'tools',
  description: 'Check bot ping, uptime, and system stats',
  usage: '.ping',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const start = Date.now();
    const sent  = await sock.sendMessage(from, { text: '🏓 Pong!' }, { quoted: msg });
    const ms    = Date.now() - start;

    const uptime = fmtUptime(process.uptime());
    const memMB  = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const freeMB = Math.round(os.freemem() / 1024 / 1024);
    const totMB  = Math.round(os.totalmem() / 1024 / 1024);
    const cpuPct = Math.min(100, Math.round(os.loadavg()[0] * 100 / os.cpus().length));

    await sock.sendMessage(from, {
      text:
        `╔═══════════════════════╗\n` +
        `  ⚡ *NovaSpark Status*  \n` +
        `╚═══════════════════════╝\n\n` +
        `🏓  Ping    : *${ms} ms*\n` +
        `⏱️  Uptime  : *${uptime}*\n` +
        `📦  Version : *v${config.botVersion}*\n` +
        `🧠  Heap    : *${memMB} MB*\n` +
        `💾  RAM     : *${freeMB}/${totMB} MB*\n` +
        `⚙️  CPU     : *${cpuPct}%*\n\n` +
        `_🟢 All systems operational_`,
    }, { quoted: msg });
  },
};
