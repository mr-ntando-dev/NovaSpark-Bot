/**
 * ⚡ NovaSpark v9 — Slow Mode
 * .slowmode on 30 — Users can only send 1 msg per 30s
 * .slowmode off — Disable
 * .slowmode status — Check current setting
 * Admins/VIPs bypass slow mode.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// In-memory cooldown tracker: groupId → Map(senderJid → lastMsgTimestamp)
const cooldowns = new Map();

module.exports = {
  name: 'slowmode',
  aliases: ['slow', 'cooldown'],
  description: '🐢 Slow Mode — limit how often members can send messages',
  category: 'group',
  adminOnly: true,

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'off') {
      database.updateGroupSettings(from, { slowMode: false, slowModeSeconds: 0 });
      cooldowns.delete(from);
      return reply('🐢 Slow Mode: *OFF* ✅');
    }

    if (sub === 'status') {
      const gs = database.getGroupSettings(from);
      if (!gs.slowMode) return reply('🐢 Slow Mode: *OFF*');
      return reply(`🐢 Slow Mode: *ON* — ${gs.slowModeSeconds}s cooldown between messages`);
    }

    if (sub === 'on') {
      const secs = parseInt(args[1]) || 30;
      if (secs < 5 || secs > 3600) return reply('❌ Slow mode interval must be between 5s and 3600s (1 hour).');
      database.updateGroupSettings(from, { slowMode: true, slowModeSeconds: secs });
      return reply(`🐢 Slow Mode: *ON* — ${secs}s cooldown between messages (admins exempt)`);
    }

    return reply(
      '🐢 *Slow Mode*\n\n' +
      '*.slowmode on 30* — 30 second cooldown\n' +
      '*.slowmode on 60* — 1 minute cooldown\n' +
      '*.slowmode off* — Disable\n' +
      '*.slowmode status* — Check setting'
    );
  },

  // Called from handler to enforce slow mode
  check: async (sock, msg, from, sender, groupSettings, isAdmin) => {
    if (!groupSettings.slowMode) return false;
    if (isAdmin) return false;

    const secs = groupSettings.slowModeSeconds || 30;
    if (!cooldowns.has(from)) cooldowns.set(from, new Map());
    const groupMap = cooldowns.get(from);

    const last = groupMap.get(sender) || 0;
    const now = Date.now();
    const elapsed = (now - last) / 1000;

    if (elapsed < secs) {
      const wait = Math.ceil(secs - elapsed);
      try {
        await sock.sendMessage(from, { delete: msg.key });
        await sock.sendMessage(from, {
          text: `🐢 *Slow mode is on!* Wait *${wait}s* before sending another message.`,
          mentions: [sender],
        });
      } catch {}
      return true; // message blocked
    }

    groupMap.set(sender, now);
    return false;
  },
};
