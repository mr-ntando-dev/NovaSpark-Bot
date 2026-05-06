/**
 * ⚡ NovaSpark Bot — Auto Nudge (Inactive Member Reminder)
 * Tags members who haven't spoken in N days.
 * .autonudge on <days>   — tag members silent for N days
 * .autonudge off
 * .autonudge now         — run immediately
 * Runs daily at midnight.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'autonudge',
  aliases: ['nudge', 'inactivecheck'],
  adminOnly: true,
  groupOnly: true,
  category: 'group',
  description: 'Tag and nudge members inactive for N days',
  usage: '.autonudge on <days> | off | now',

  async execute({ sock, from, msg, args, reply, isAdmin, groupMeta }) {
    if (!isAdmin) return reply('🔒 Only admins can configure Auto-Nudge.');

    const sub  = (args[0] || '').toLowerCase();
    const days = Math.max(1, parseInt(args[1]) || 3);

    if (sub === 'on') {
      database.updateGroupSettings(from, { autonudge: true, nudgeDays: days });
      return reply(
        `📣 *Auto-Nudge ENABLED*\n\n` +
        `Members inactive for *${days}+ days* will be tagged daily.\n\n` +
        `_Use .autonudge now to run immediately._\n` +
        `_Use .autonudge off to disable._`
      );
    }

    if (sub === 'off') {
      database.updateGroupSettings(from, { autonudge: false });
      return reply('📣 *Auto-Nudge DISABLED*');
    }

    // Run now
    if (sub === 'now' || sub === 'run') {
      if (!groupMeta) return reply('❌ Could not fetch group info.');
      const settings = database.getGroupSettings(from);
      const threshold = (settings.nudgeDays || days) * 86400000;
      const now       = Date.now();

      const stats = database.getGroupStats(from);
      const chatters = stats.chatters || {};

      const inactive = groupMeta.participants.filter(p => {
        if (p.admin) return false; // skip admins
        const lastMsg = chatters[p.id] ? chatters[p.id].lastSeen || 0 : 0;
        return (now - lastMsg) > threshold;
      });

      if (!inactive.length) return reply('✅ No inactive members found! Everyone is active.');

      const mentions = inactive.map(p => p.id);
      const names    = inactive.map(p => `@${p.id.split('@')[0]}`).join(' ');
      const d        = settings.nudgeDays || days;

      await sock.sendMessage(from, {
        text:
          `📣 *Inactive Member Nudge*\n\n` +
          `Hey ${names}!\n\n` +
          `You haven't been active for ${d}+ days.\n` +
          `Drop a message — stay part of the group! 💬`,
        mentions,
      }, { quoted: msg });
      return;
    }

    const s = database.getGroupSettings(from);
    return reply(
      `📣 *Auto-Nudge Status*\n\n` +
      `Status : ${s.autonudge ? '🟢 On' : '🔴 Off'}\n` +
      `Days   : ${s.nudgeDays || 3}\n\n` +
      `_.autonudge on <days>_\n` +
      `_.autonudge now — run immediately_\n` +
      `_.autonudge off_`
    );
  },
};
