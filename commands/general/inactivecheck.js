/**
 * ⚡ NovaSpark Bot — Inactive Members Check
 * .inactive  — lists members who haven't sent a message in the tracked period
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

module.exports = {
  name: 'inactive',
  aliases: ['inactivecheck', 'lurkers', 'ghostmembers'],
  category: 'general',
  description: 'Show members who have not sent a message recently',
  usage: '.inactive [days]  — default 7 days',
  adminOnly: true,
  groupOnly: true,

  async execute({ sock, msg, from, args, reply, groupMeta, isBotAdmin }) {
    const days      = parseInt(args[0] || '7', 10) || 7;
    const cutoff    = Date.now() - days * 24 * 60 * 60 * 1000;
    const db        = database.getGroupSettings ? database.getGroupSettings(from) : {};
    const activity  = db?.memberActivity || {};

    const participants = (groupMeta?.participants || []).filter(p => !p.admin);
    const inactive     = participants.filter(p => {
      const lastSeen = activity[p.id];
      return !lastSeen || lastSeen < cutoff;
    });

    if (!inactive.length) {
      return reply(`✅ No inactive members in the last *${days} days*. This group is active! 🎉`);
    }

    const mentions = inactive.map(p => p.id);
    const lines    = inactive.map((p, i) => {
      const jid      = p.id;
      const num      = jid.split('@')[0];
      const lastSeen = activity[jid];
      const ago      = lastSeen
        ? `last seen ${Math.floor((Date.now() - lastSeen) / 86400000)}d ago`
        : 'never seen';
      return `${i + 1}. @${num} (${ago})`;
    });

    await sock.sendMessage(from, {
      text:
        `👻 *Inactive Members Report*\n` +
        `📅 Not active in *${days} days*\n\n` +
        `${lines.join('\n')}\n\n` +
        `Total: *${inactive.length}/${participants.length}* inactive members\n\n` +
        `_Admins: Use \`.kick @user\` to remove ghosts_`,
      mentions,
    }, { quoted: msg });
  },
};
