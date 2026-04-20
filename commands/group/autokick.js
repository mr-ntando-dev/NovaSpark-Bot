/**
 * ⚡ NovaSpark Bot — Auto-Kick System
 * .autokick join <minutes>  — kick members who don't send a message within N minutes of joining
 * .autokick off
 * .autokick status
 * Also exposes checkNewMember() for the welcome handler integration.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// In-memory: jid → { gid, joinedAt, deadline }
const _pending = new Map();

// Called when a new member joins (from welcome handler)
function scheduleKick(gid, jid, delayMs) {
  const key = `${gid}:${jid}`;
  const deadline = Date.now() + delayMs;
  _pending.set(key, { gid, jid, deadline });
}

// Called whenever someone sends a message
function clearKick(gid, jid) {
  _pending.delete(`${gid}:${jid}`);
}

// Poller — call every 30s from handler
async function pollKicks(sock) {
  const now = Date.now();
  for (const [key, entry] of _pending.entries()) {
    if (now < entry.deadline) continue;
    _pending.delete(key);
    const settings = database.getAutokickSettings(entry.gid);
    if (!settings.enabled) continue;
    try {
      await sock.groupParticipantsUpdate(entry.gid, [entry.jid], 'remove');
      await sock.sendMessage(entry.gid, {
        text: `⏱️ @${entry.jid.split('@')[0]} was removed for not saying anything within ${Math.round(settings.delayMs / 60000)} minutes of joining.`,
        mentions: [entry.jid],
      });
    } catch {}
  }
}

module.exports = {
  name: 'autokick',
  aliases: ['kicksilent', 'silentautokick'],
  adminOnly: true,
  groupOnly: true,
  category: 'group',
  description: 'Kick members who stay silent after joining',
  usage: '.autokick join <minutes> | off | status',

  scheduleKick,
  clearKick,
  pollKicks,

  async execute({ sock, from, args, reply, isAdmin }) {
    if (!isAdmin) return reply('🔒 Only admins can configure Auto-Kick.');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'join') {
      const mins = Math.max(1, parseInt(args[1]) || 5);
      database.setAutokickSettings(from, { enabled: true, delayMs: mins * 60000 });
      return reply(
        `⏱️ *Auto-Kick (Silent Join) ENABLED*\n\n` +
        `New members must send at least 1 message within *${mins} minutes* or they'll be removed.\n\n` +
        `_Use .autokick off to disable_`
      );
    }
    if (sub === 'off') {
      database.setAutokickSettings(from, { enabled: false });
      return reply('⏱️ *Auto-Kick DISABLED*');
    }

    const s = database.getAutokickSettings(from);
    return reply(
      `⏱️ *Auto-Kick Status*\n\n` +
      `Status : ${s.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n` +
      `Delay  : ${s.delayMs ? Math.round(s.delayMs / 60000) + ' minutes' : 'Not set'}\n\n` +
      `_.autokick join <minutes> — enable_\n` +
      `_.autokick off — disable_`
    );
  },
};
