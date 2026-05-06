/**
 * ⚡ NovaSpark Bot v10 — Advanced Analytics Dashboard
 * Track command usage, user engagement, response times, errors
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');
const config = require('../../config');

// In-memory analytics buffer (flushed periodically)
const analyticsBuffer = {
  commands: {},       // command -> count
  users: {},         // user -> { commands, messages, lastSeen }
  hourly: {},        // hour -> message count
  errors: [],        // recent errors
  responseTimes: [], // last 100 response times in ms
  startTime: Date.now(),
};

function trackCommand(commandName, userId, responseTime) {
  // Command usage
  analyticsBuffer.commands[commandName] = (analyticsBuffer.commands[commandName] || 0) + 1;

  // User activity
  if (!analyticsBuffer.users[userId]) {
    analyticsBuffer.users[userId] = { commands: 0, messages: 0, lastSeen: 0 };
  }
  analyticsBuffer.users[userId].commands++;
  analyticsBuffer.users[userId].lastSeen = Date.now();

  // Hourly distribution
  const hour = new Date().getHours().toString();
  analyticsBuffer.hourly[hour] = (analyticsBuffer.hourly[hour] || 0) + 1;

  // Response time
  if (responseTime) {
    analyticsBuffer.responseTimes.push(responseTime);
    if (analyticsBuffer.responseTimes.length > 100) analyticsBuffer.responseTimes.shift();
  }

  // Persist every 50 commands
  const total = Object.values(analyticsBuffer.commands).reduce((a, b) => a + b, 0);
  if (total % 50 === 0) flushAnalytics();
}

function trackMessage(userId) {
  if (!analyticsBuffer.users[userId]) {
    analyticsBuffer.users[userId] = { commands: 0, messages: 0, lastSeen: 0 };
  }
  analyticsBuffer.users[userId].messages++;
  analyticsBuffer.users[userId].lastSeen = Date.now();
}

function trackError(command, error) {
  analyticsBuffer.errors.push({ command, error: error.substring(0, 200), time: Date.now() });
  if (analyticsBuffer.errors.length > 50) analyticsBuffer.errors.shift();
}

function flushAnalytics() {
  try {
    const existing = database.getSetting('analytics') || {};
    const merged = {
      commands: { ...existing.commands },
      totalCommands: (existing.totalCommands || 0) + Object.values(analyticsBuffer.commands).reduce((a, b) => a + b, 0),
      totalUsers: Object.keys(analyticsBuffer.users).length,
      lastFlush: Date.now(),
    };
    // Merge command counts
    for (const [cmd, count] of Object.entries(analyticsBuffer.commands)) {
      merged.commands[cmd] = (merged.commands[cmd] || 0) + count;
    }
    database.setSetting('analytics', merged);
  } catch {}
}

function getUptime() {
  const ms = Date.now() - analyticsBuffer.startTime;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

module.exports = {
  name: 'analytics',
  aliases: ['stats2', 'dashboard', 'usage', 'insights'],
  category: 'owner',
  description: 'Advanced analytics dashboard — command usage, engagement, performance',
  usage: '.analytics [commands|users|errors|hourly]',
  ownerOnly: true,

  trackCommand,
  trackMessage,
  trackError,

  async execute({ sock, msg, from, args, reply }) {
    const sub = (args[0] || 'overview').toLowerCase();

    switch (sub) {
      case 'commands': case 'cmds': {
        const cmds = analyticsBuffer.commands;
        const sorted = Object.entries(cmds).sort((a, b) => b[1] - a[1]).slice(0, 15);
        if (!sorted.length) return reply('📊 No command data yet.');
        const list = sorted.map(([cmd, count], i) => `${i + 1}. \`${cmd}\` — ${count} uses`).join('\n');
        return reply(`📊 *Top Commands (this session)*\n\n${list}`);
      }

      case 'users': {
        const users = Object.entries(analyticsBuffer.users)
          .sort((a, b) => b[1].commands - a[1].commands)
          .slice(0, 10);
        if (!users.length) return reply('📊 No user data yet.');
        const list = users.map(([id, data], i) =>
          `${i + 1}. ${id.split('@')[0]} — ${data.commands} cmds, ${data.messages} msgs`
        ).join('\n');
        return reply(`📊 *Top Users (this session)*\n\n${list}`);
      }

      case 'errors': {
        const errs = analyticsBuffer.errors;
        if (!errs.length) return reply('✅ No errors recorded.');
        const list = errs.slice(-10).map((e, i) =>
          `${i + 1}. \`${e.command}\` — ${e.error.substring(0, 60)}`
        ).join('\n');
        return reply(`⚠️ *Recent Errors*\n\n${list}`);
      }

      case 'hourly': {
        const hours = analyticsBuffer.hourly;
        const bars = Array.from({ length: 24 }, (_, i) => {
          const count = hours[i.toString()] || 0;
          const bar = '█'.repeat(Math.min(count, 20));
          return `${i.toString().padStart(2, '0')}:00 ${bar} ${count}`;
        }).join('\n');
        return reply(`📊 *Hourly Activity*\n\n\`\`\`\n${bars}\n\`\`\``);
      }

      case 'performance': case 'perf': {
        const times = analyticsBuffer.responseTimes;
        if (!times.length) return reply('📊 No performance data yet.');
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const max = Math.max(...times);
        const min = Math.min(...times);
        return reply(`⚡ *Performance*\n\n• Avg response: ${avg}ms\n• Fastest: ${min}ms\n• Slowest: ${max}ms\n• Samples: ${times.length}`);
      }

      default: {
        const totalCmds = Object.values(analyticsBuffer.commands).reduce((a, b) => a + b, 0);
        const totalUsers = Object.keys(analyticsBuffer.users).length;
        const avgTime = analyticsBuffer.responseTimes.length
          ? Math.round(analyticsBuffer.responseTimes.reduce((a, b) => a + b, 0) / analyticsBuffer.responseTimes.length) + 'ms'
          : 'N/A';

        return reply(`📊 *NovaSpark Analytics*\n\n⏱️ Uptime: ${getUptime()}\n📨 Commands: ${totalCmds}\n👥 Users: ${totalUsers}\n⚡ Avg Response: ${avgTime}\n❌ Errors: ${analyticsBuffer.errors.length}\n\n*Sections:*\n• \`.analytics commands\` — Top commands\n• \`.analytics users\` — Top users\n• \`.analytics hourly\` — Activity by hour\n• \`.analytics errors\` — Recent errors\n• \`.analytics performance\` — Response times`);
      }
    }
  },
};
