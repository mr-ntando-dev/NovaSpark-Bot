/**
 * ⚡ NovaSpark Bot v10 — Advanced Scheduled Messages
 * Cron-like message scheduling with recurring support
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');
const config = require('../../config');

// In-memory schedule store
let schedules = [];
let schedulerInterval = null;

function loadSchedules() {
  try {
    const data = database.getSetting('schedules');
    schedules = data || [];
  } catch { schedules = []; }
}

function saveSchedules() {
  database.setSetting('schedules', schedules);
}

function startScheduler(sock) {
  if (schedulerInterval) return;
  loadSchedules();

  schedulerInterval = setInterval(async () => {
    const now = Date.now();
    const due = schedules.filter(s => s.nextRun <= now && s.active);

    for (const job of due) {
      try {
        await sock.sendMessage(job.chatId, { text: job.message });

        if (job.recurring && job.intervalMs) {
          job.nextRun = now + job.intervalMs;
          job.runs = (job.runs || 0) + 1;
        } else {
          job.active = false;
        }
      } catch {}
    }

    schedules = schedules.filter(s => s.active);
    saveSchedules();
  }, 30000); // Check every 30 seconds
}

function parseTime(timeStr) {
  // Supports: "5m", "1h", "2d", "30s", "HH:MM"
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (match) return parseInt(match[1]) * units[match[2]];

  // HH:MM format - schedule for next occurrence
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const now = new Date();
    const target = new Date();
    target.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target.getTime() - now.getTime();
  }

  return null;
}

module.exports = {
  name: 'schedule',
  aliases: ['sched', 'cron', 'timer', 'schedulemsg'],
  category: 'owner',
  description: 'Schedule messages — one-time or recurring',
  usage: '.schedule <time> <message>',
  ownerOnly: true,

  startScheduler,

  async execute({ sock, msg, from, args, reply, sender }) {
    const sub = (args[0] || '').toLowerCase();

    switch (sub) {
      case 'list': {
        loadSchedules();
        if (!schedules.length) return reply('📅 No scheduled messages.');
        const list = schedules.map((s, i) =>
          `${i + 1}. ${s.recurring ? '🔄' : '⏰'} In ${Math.round((s.nextRun - Date.now()) / 60000)}m → ${s.message.substring(0, 40)}...`
        ).join('\n');
        return reply(`📅 *Scheduled Messages*\n\n${list}\n\n_Use \`.schedule cancel <number>\` to remove_`);
      }

      case 'cancel': case 'remove': case 'delete': {
        const idx = parseInt(args[1]) - 1;
        loadSchedules();
        if (isNaN(idx) || idx < 0 || idx >= schedules.length) return reply('❌ Invalid schedule number.');
        schedules.splice(idx, 1);
        saveSchedules();
        return reply('✅ Schedule cancelled.');
      }

      case 'clear': {
        schedules = [];
        saveSchedules();
        return reply('🗑️ All schedules cleared.');
      }

      default: {
        // Format: .schedule <time> [--repeat] <message>
        // OR: .schedule <time> --to <groupJid> <message>
        let time = args[0];
        let recurring = false;
        let targetChat = from;
        let messageArgs = args.slice(1);

        if (!time) {
          return reply('📅 *Message Scheduler*\n\n*Usage:*\n• `.schedule 5m Hello!` — Send in 5 minutes\n• `.schedule 1h --repeat Check-in time!` — Repeat every hour\n• `.schedule 14:30 Meeting reminder` — Send at 14:30\n• `.schedule list` — View scheduled\n• `.schedule cancel 1` — Cancel by number\n• `.schedule clear` — Cancel all\n\n*Time formats:* 30s, 5m, 2h, 1d, 14:30');
        }

        // Parse flags
        const filteredArgs = [];
        for (let i = 0; i < messageArgs.length; i++) {
          if (messageArgs[i] === '--repeat' || messageArgs[i] === '-r') { recurring = true; continue; }
          if (messageArgs[i] === '--to' && messageArgs[i + 1]) { targetChat = messageArgs[++i]; continue; }
          filteredArgs.push(messageArgs[i]);
        }

        const message = filteredArgs.join(' ');
        if (!message) return reply('❌ No message provided. Usage: `.schedule 5m Hello everyone!`');

        const delayMs = parseTime(time);
        if (!delayMs) return reply('❌ Invalid time format. Use: 30s, 5m, 2h, 1d, or HH:MM');

        loadSchedules();
        schedules.push({
          id: Date.now().toString(36),
          chatId: targetChat,
          message,
          nextRun: Date.now() + delayMs,
          intervalMs: recurring ? delayMs : null,
          recurring,
          active: true,
          createdBy: sender,
          runs: 0,
        });
        saveSchedules();
        startScheduler(sock);

        const timeLabel = time.includes(':') ? `at ${time}` : `in ${time}`;
        await sock.sendMessage(from, { react: { text: '📅', key: msg.key } });
        return reply(`📅 *Scheduled!*\n\n⏰ ${timeLabel}${recurring ? ' (recurring)' : ''}\n💬 "${message.substring(0, 100)}"`);
      }
    }
  },
};
