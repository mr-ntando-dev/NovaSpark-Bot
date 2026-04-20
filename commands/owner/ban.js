/**
 * ⚡ NovaSpark Bot v5 — Ban / Unban System
 * .ban @user [reason]  — blacklist a user bot-wide (all commands ignored)
 * .unban @user         — remove from blacklist
 * .banlist             — view all banned users
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const BAN_FILE = path.resolve(__dirname, '../../data/banlist.json');

function readBans() {
  try {
    if (!fs.existsSync(BAN_FILE)) return {};
    return JSON.parse(fs.readFileSync(BAN_FILE, 'utf8'));
  } catch { return {}; }
}

function writeBans(data) {
  const dir = path.dirname(BAN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BAN_FILE, JSON.stringify(data, null, 2));
}

// Exported checker — called in handler.js to silently drop banned users
const isBanned = (jid) => {
  const bans = readBans();
  const num  = jid.split('@')[0].split(':')[0];
  return !!(bans[jid] || bans[num + '@s.whatsapp.net'] || bans[num]);
};

module.exports = [
  // ── expose checker ────────────────────────────────────────────────────────
  { _isBannedExport: true, isBanned },

  // ── .ban ──────────────────────────────────────────────────────────────────
  {
    name: 'ban',
    aliases: ['blacklist', 'botban'],
    description: '🚫 Ban a user from using the bot',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, from, msg, sender, args, reply, mentions }) {
      const target = mentions?.[0];
      if (!target) return reply('Usage: `.ban @user [reason]`');

      const config = require('../../config');
      const ownerNums = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
      if (ownerNums.includes(target.split('@')[0])) return reply('❌ Cannot ban the owner.');

      const reason = args.filter(a => !a.startsWith('@')).join(' ') || 'No reason given';
      const bans   = readBans();
      const num    = target.split('@')[0];

      if (bans[target]) return reply(`⚠️ @${num} is already banned.\n_Reason: ${bans[target].reason}_`);

      bans[target] = { reason, bannedBy: sender, bannedAt: new Date().toISOString() };
      writeBans(bans);

      await sock.sendMessage(from, {
        text: `🚫 *@${num} has been banned from using the bot.*\n\n📋 Reason: _${reason}_`,
        mentions: [target],
      });
    },
  },

  // ── .unban ────────────────────────────────────────────────────────────────
  {
    name: 'unban',
    aliases: ['unblacklist', 'botunban'],
    description: '✅ Unban a user',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, from, args, reply, mentions }) {
      const target = mentions?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!target) return reply('Usage: `.unban @user` or `.unban 2637XXXXXXXX`');

      const bans = readBans();
      const num  = target.split('@')[0];

      if (!bans[target]) return reply(`ℹ️ @${num} is not in the ban list.`);

      delete bans[target];
      writeBans(bans);

      await sock.sendMessage(from, {
        text: `✅ *@${num} has been unbanned.* They can use the bot again.`,
        mentions: [target],
      });
    },
  },

  // ── .banlist ──────────────────────────────────────────────────────────────
  {
    name: 'banlist',
    aliases: ['banned', 'blacklisted'],
    description: '📋 View all banned users',
    category: 'owner',
    ownerOnly: true,

    async execute({ reply }) {
      const bans    = readBans();
      const entries = Object.entries(bans).filter(([k]) => !k.startsWith('_'));

      if (!entries.length) return reply('✅ No users are currently banned.');

      const lines = entries.map(([jid, info], i) => {
        const num  = jid.split('@')[0];
        const date = info.bannedAt ? new Date(info.bannedAt).toLocaleDateString('en-ZA') : '?';
        return `  ${i + 1}. +${num}\n     📋 ${info.reason || 'No reason'}\n     📅 ${date}`;
      });

      await reply(
        `🚫 *Banned Users (${entries.length})*\n` +
        '━'.repeat(30) + '\n\n' +
        lines.join('\n\n')
      );
    },
  },
];

// Named export for handler access
module.exports.isBanned = isBanned;
