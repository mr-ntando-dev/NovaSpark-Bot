/**
 * ⚡ NovaSpark Bot v11 — .schedmsg
 * Schedule any message to be sent after a delay or at a specific time.
 * Works in groups and DMs. Supports: +10m, +2h, +1d, or HH:MM (today/tomorrow).
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

// ── In-memory timer store (survives hot-reloads, not crashes) ─────────────────
// For persistence, we piggyback on the database settings layer.
const SCHED_KEY = '__schedmsg_queue';

function getQueue() {
  return database.getSetting(SCHED_KEY) || [];
}
function saveQueue(q) {
  database.setSetting(SCHED_KEY, q);
}

// ── Parse time argument ───────────────────────────────────────────────────────
// Supports: +5m  +2h  +1d  14:30  or  14:30:00
function parseDelay(arg) {
  // Relative: +Xm / +Xh / +Xd
  const rel = arg.match(/^\+(\d+)(m|h|d)$/i);
  if (rel) {
    const n = parseInt(rel[1]);
    const unit = rel[2].toLowerCase();
    const ms = unit === 'm' ? n * 60_000 : unit === 'h' ? n * 3_600_000 : n * 86_400_000;
    return { ms, label: `${n}${unit}` };
  }
  // Absolute: HH:MM
  const abs = arg.match(/^(\d{1,2}):(\d{2})$/);
  if (abs) {
    const tz   = config.timezone || 'Africa/Harare';
    const now  = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
    let target = new Date(now);
    target.setHours(parseInt(abs[1]), parseInt(abs[2]), 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1); // next day
    const ms = target - now;
    return { ms, label: abs[0] };
  }
  return null;
}

// ── Boot: restore any saved scheduled messages ────────────────────────────────
let _booted = false;
function bootRestoreQueue(sock) {
  if (_booted) return;
  _booted = true;
  const queue = getQueue();
  const now   = Date.now();
  const fresh = [];
  for (const item of queue) {
    const remaining = item.sendAt - now;
    if (remaining <= 0) continue; // past — drop it
    fresh.push(item);
    setTimeout(() => sendScheduled(sock, item), remaining);
  }
  saveQueue(fresh);
}

async function sendScheduled(sock, item) {
  try {
    await sock.sendMessage(item.jid, { text: `⏰ *Scheduled Message:*\n\n${item.text}` });
  } catch {}
  // Remove from queue
  const q = getQueue().filter(x => x.id !== item.id);
  saveQueue(q);
}

module.exports = {
  name:        'schedmsg',
  aliases:     ['schedmsgqueue', 'sendlater', 'remind2', 'schedtimer'],
  category:    'tools',
  description: 'Schedule a message to be sent after a delay or at a specific time',
  usage:       '.schedmsg +10m <message>  OR  .schedmsg 14:30 <message>',

  execute: async ({ sock, msg, from, args, reply, sender }) => {
    // Boot restore on first use
    bootRestoreQueue(sock);

    if (args.length < 2) {
      return reply([
        '⏰ *Message Scheduler*',
        '',
        '*Usage:*',
        '  `.schedmsg +10m Hello everyone!`',
        '  `.schedmsg +2h Meeting starts soon!`',
        '  `.schedmsg +1d Good morning!`',
        '  `.schedmsg 14:30 Reminder: prayer time`',
        '',
        '*List scheduled:* `.schedmsg list`',
        '*Cancel:* `.schedmsg cancel <id>`',
      ].join('\n'));
    }

    // List command
    if (args[0].toLowerCase() === 'list') {
      const q = getQueue().filter(x => x.jid === from);
      if (!q.length) return reply('📭 No messages scheduled for this chat.');
      const lines = ['⏰ *Scheduled Messages:*', ''];
      for (const item of q) {
        const left = Math.round((item.sendAt - Date.now()) / 60_000);
        lines.push(`🆔 \`${item.id}\` — in *${left}m* — "${item.text.slice(0,40)}${item.text.length>40?'…':''}"`);
      }
      return reply(lines.join('\n'));
    }

    // Cancel command
    if (args[0].toLowerCase() === 'cancel') {
      const id = args[1];
      if (!id) return reply('Usage: `.schedmsg cancel <id>`');
      const q = getQueue();
      const newQ = q.filter(x => !(x.id === id && x.jid === from));
      if (newQ.length === q.length) return reply(`❌ No scheduled message found with ID \`${id}\` in this chat.`);
      saveQueue(newQ);
      return reply(`✅ Cancelled scheduled message \`${id}\`.`);
    }

    // Parse time
    const parsed = parseDelay(args[0]);
    if (!parsed) {
      return reply('❌ Invalid time format. Use `+5m`, `+2h`, `+1d`, or `14:30`.');
    }

    const text   = args.slice(1).join(' ');
    const sendAt = Date.now() + parsed.ms;
    const id     = Math.random().toString(36).slice(2, 8).toUpperCase();

    const item = { id, jid: from, text, sendAt, sender };
    const q    = getQueue();
    q.push(item);
    saveQueue(q);

    setTimeout(() => sendScheduled(sock, item), parsed.ms);

    const eta = new Date(sendAt).toLocaleString('en-ZA', {
      timeZone: config.timezone || 'Africa/Harare',
      hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',
    });

    return reply([
      `✅ *Message Scheduled!*`,
      `🆔 ID: \`${id}\``,
      `⏱️ Sends in: *${parsed.label}*`,
      `📅 At: *${eta}*`,
      `💬 Message: "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`,
      '',
      `_Cancel anytime: \`.schedmsg cancel ${id}\`_`,
    ].join('\n'));
  },
};
