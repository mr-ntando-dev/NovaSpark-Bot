/**
 * ⚡ NovaSpark Bot — Anti-Raid Protection
 * Detects mass-joins (raid) and auto-locks the group.
 * .antiraid on [joins_per_minute]  — default: 5 joins/min triggers lock
 * .antiraid off
 * .antiraid status
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// In-memory join tracker: gid → [timestamp, ...]
const _joinTimes = new Map();

// Returns true if a raid is detected after this join
function trackJoin(gid, limit) {
  const now  = Date.now();
  const prev = _joinTimes.get(gid) || [];
  const window = prev.filter(t => now - t < 60000); // last 60s
  window.push(now);
  _joinTimes.set(gid, window);
  return window.length >= limit;
}

// Called from handler's group participant update event
async function checkRaid(sock, gid, action) {
  if (action !== 'add') return;
  const settings = database.getSetting(`antiraid_${gid}`) || {};
  if (!settings.enabled) return;
  const limit = settings.limit || 5;
  if (!trackJoin(gid, limit)) return;

  // Raid detected — lock the group
  try {
    await sock.groupSettingUpdate(gid, 'announcement');
    await sock.sendMessage(gid, {
      text:
        `🚨 *ANTI-RAID TRIGGERED!*\n\n` +
        `${limit}+ members joined within 60 seconds.\n` +
        `🔒 Group has been *locked* to prevent further damage.\n\n` +
        `_Admins: use .unmute to reopen when safe._`,
    });
    _joinTimes.delete(gid); // reset counter
  } catch {}
}

module.exports = {
  name: 'antiraid',
  aliases: ['raidprot', 'raidprotection'],
  adminOnly: true,
  groupOnly: true,
  category: 'group',
  description: 'Auto-lock group on mass-join raids',
  usage: '.antiraid on [limit] | off | status',

  checkRaid,

  async execute({ sock, from, args, reply, isAdmin }) {
    if (!isAdmin) return reply('🔒 Only admins can configure Anti-Raid.');

    const sub   = (args[0] || '').toLowerCase();
    const limit = Math.max(2, parseInt(args[1]) || 5);

    if (sub === 'on') {
      database.setSetting(`antiraid_${from}`, { enabled: true, limit });
      return reply(
        `🚨 *Anti-Raid ENABLED*\n\n` +
        `Trigger : *${limit} joins within 60 seconds*\n` +
        `Action  : Auto-lock group + alert\n\n` +
        `_Use .antiraid off to disable_`
      );
    }
    if (sub === 'off') {
      database.setSetting(`antiraid_${from}`, { enabled: false });
      return reply('🚨 *Anti-Raid DISABLED*');
    }

    const s = database.getSetting(`antiraid_${from}`) || {};
    return reply(
      `🚨 *Anti-Raid Status*\n\n` +
      `Status : ${s.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n` +
      `Limit  : ${s.limit || 5} joins / 60s\n\n` +
      `_.antiraid on [limit]_\n_.antiraid off_`
    );
  },
};
