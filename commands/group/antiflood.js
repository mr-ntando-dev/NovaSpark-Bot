/**
 * ⚡ NovaSpark Bot — Anti-Flood
 * Detects message flooding (spam) and auto-warns/kicks the offender.
 * .antiflood on [limit] — enable (default: 7 msgs / 10 seconds)
 * .antiflood off
 * .antiflood status
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// ── Runtime flood counter (in-memory per bot session) ─────────────────────────
const _flood = new Map(); // key: `${gid}:${jid}` → { count, reset }

function track(gid, jid, limit) {
  const key   = `${gid}:${jid}`;
  const now   = Date.now();
  const entry = _flood.get(key) || { count: 0, reset: now + 10000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 10000; }
  entry.count++;
  _flood.set(key, entry);
  return entry.count >= limit;
}

// ── Auto-check (called from handler for every non-command group message) ──────
async function check(sock, msg, from, groupSettings) {
  const settings = database.getFloodSettings(from);
  if (!settings.enabled) return false;
  const limit    = settings.limit || 7;
  const sender   = msg.key.participant || msg.key.remoteJid;
  if (!sender || sender === sock.user?.id) return false;

  const flooded = track(from, sender, limit);
  if (!flooded) return false;

  // Auto-warn first, then kick on 3rd flood event
  const warnCount = database.addWarn(from, sender, 'Anti-Flood: message flooding');
  const warnLimit = groupSettings?.warnLimit || 3;

  try {
    await sock.sendMessage(from, {
      text: `🌊 *Anti-Flood Warning* ⚠️\n@${sender.split('@')[0]} — You're sending messages too fast!\nSlowdown or you'll be removed.\n*(Warn ${warnCount}/${warnLimit})*`,
      mentions: [sender],
    });
    if (warnCount >= warnLimit) {
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
      await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} was removed for flooding.`, mentions: [sender] });
      database.clearWarns(from, sender);
    }
  } catch {}
  return true;
}

module.exports = {
  name: 'antiflood',
  aliases: ['floodprot', 'floodprotection'],
  adminOnly: true,
  groupOnly: true,
  category: 'group',
  description: 'Block message flooding — auto-warn & kick spammers',
  usage: '.antiflood on [limit] | off | status',

  check,

  async execute({ sock, from, args, reply, isAdmin }) {
    if (!isAdmin) return reply('🔒 Only admins can configure Anti-Flood.');

    const sub   = (args[0] || '').toLowerCase();
    const limit = parseInt(args[1]) || 7;

    if (sub === 'on') {
      database.setFloodSettings(from, { enabled: true, limit });
      return reply(
        `🌊 *Anti-Flood ENABLED*\n\n` +
        `📊 Limit  : *${limit} messages / 10 seconds*\n` +
        `⚠️ Action : Warn → Kick (after ${limit} msgs)\n\n` +
        `_Use .antiflood off to disable_`
      );
    }
    if (sub === 'off') {
      database.setFloodSettings(from, { enabled: false });
      return reply('🌊 *Anti-Flood DISABLED*');
    }

    // status
    const s = database.getFloodSettings(from);
    return reply(
      `🌊 *Anti-Flood Status*\n\n` +
      `Status : ${s.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n` +
      `Limit  : ${s.limit || 7} msgs / 10s\n\n` +
      `_.antiflood on [limit] — enable_\n` +
      `_.antiflood off — disable_`
    );
  },
};
