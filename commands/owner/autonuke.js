/**
 * ⚡ NovaSpark Bot v8.0 — Auto Nuke Spam
 * .autonuke on/off      — Enable/disable auto-nuke of repeat spam
 * .autonuke threshold N — Set message repeat threshold (default 5)
 * .autonuke action warn/kick/mute
 * Detects users sending the same message repeatedly and takes action
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// In-memory: { jid: { userJid: [{ text, ts }] } }
const spamTracker = new Map();

function cleanOld(arr) {
  const cutoff = Date.now() - 60_000; // 60 seconds window
  return arr.filter(e => e.ts > cutoff);
}

module.exports = {
  name: 'autonuke',
  aliases: ['nuke', 'antispamhard'],
  description: 'Auto-nuke repeat spam with configurable threshold and action',
  category: 'owner',
  ownerOnly: false,

  onMessage: async ({ sock, msg, from, text, sender, isAdmin, isOwner }) => {
    if (!text || isAdmin || isOwner) return;
    const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
    if (!gs.autoNuke) return;

    const threshold = gs.nukeThreshold || 5;
    const action    = gs.nukeAction    || 'warn';

    if (!spamTracker.has(from)) spamTracker.set(from, new Map());
    const groupMap = spamTracker.get(from);
    if (!groupMap.has(sender)) groupMap.set(sender, []);

    let entries = cleanOld(groupMap.get(sender));
    entries.push({ text: text.trim().toLowerCase(), ts: Date.now() });
    groupMap.set(sender, entries);

    // Count exact repeats
    const repeatCount = entries.filter(e => e.text === text.trim().toLowerCase()).length;
    if (repeatCount < threshold) return;

    // Clear tracker for this user
    groupMap.set(sender, []);

    try {
      await sock.sendMessage(from, { delete: msg.key });
    } catch {}

    if (action === 'warn') {
      const warns = database.addWarn ? database.addWarn(from, sender, 'Auto-nuke: repeat spam') : 1;
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split('@')[0]} — *Spam detected!* You were warned. (${warns} warn(s))\n_Repeating the same message ${threshold} times is not allowed._`,
        mentions: [sender],
      });
    } else if (action === 'kick') {
      await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
      await sock.sendMessage(from, {
        text: `🚫 @${sender.split('@')[0]} was *removed* for spam (same message repeated ${threshold}x).`,
        mentions: [sender],
      });
    } else if (action === 'mute') {
      // We can't mute a single user on WhatsApp, so we warn + delete
      await sock.sendMessage(from, {
        text: `🔇 @${sender.split('@')[0]} — *Spam detected!* Continued spam will result in removal.`,
        mentions: [sender],
      });
    }
  },

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      database.updateGroupSettings(from, { autoNuke: true });
      return reply('💥 *Auto Nuke: ON*\n\nRepeat spammers will be auto-detected and actioned.');
    }
    if (sub === 'off') {
      database.updateGroupSettings(from, { autoNuke: false });
      return reply('💥 *Auto Nuke: OFF*');
    }
    if (sub === 'threshold') {
      const n = parseInt(args[1]);
      if (isNaN(n) || n < 2) return reply('❌ Threshold must be a number ≥ 2.');
      database.updateGroupSettings(from, { nukeThreshold: n });
      return reply(`💥 *Nuke threshold set to ${n}* — ${n} identical messages in 60s triggers action.`);
    }
    if (sub === 'action') {
      const act = (args[1] || '').toLowerCase();
      if (!['warn', 'kick', 'mute'].includes(act)) return reply('❌ Valid actions: `warn`, `kick`, `mute`');
      database.updateGroupSettings(from, { nukeAction: act });
      return reply(`💥 *Nuke action set to: ${act.toUpperCase()}*`);
    }

    const gs = database.getGroupSettings(from);
    return reply(
      '💥 *Auto Nuke — Spam Destroyer*\n\n' +
      `Status: *${gs.autoNuke ? 'ON ✅' : 'OFF ❌'}*\n` +
      `Threshold: *${gs.nukeThreshold || 5}* same messages / 60s\n` +
      `Action: *${(gs.nukeAction || 'warn').toUpperCase()}*\n\n` +
      '`.autonuke on/off` — Toggle\n' +
      '`.autonuke threshold <n>` — Set repeat limit\n' +
      '`.autonuke action warn/kick/mute` — Set action'
    );
  },
};
