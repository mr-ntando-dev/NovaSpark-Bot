/**
 * ⚡ NovaSpark Bot — User Profile Card
 * .profile [@user]  — shows a rich profile card for yourself or a tagged user
 * By Dev-Ntando
 */
'use strict';

const config   = require('../../config');
const database = require('../../database');

function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

module.exports = {
  name: 'profile',
  aliases: ['myprofile', 'userinfo', 'card', 'whoami'],
  category: 'general',
  description: 'Show a rich profile card for a user',
  usage: '.profile  |  .profile @user',

  async execute({ sock, msg, from, args, reply, sender, mentions, groupMeta }) {
    const target = mentions?.[0] || sender;
    const num    = target.split('@')[0];

    // Fetch DB stats if available
    const db      = database.getUser ? database.getUser(target) : {};
    const wallet  = db?.wallet   || 0;
    const xp      = db?.xp       || 0;
    const cmds    = db?.cmdCount || 0;
    const level   = Math.floor(xp / 100) + 1;
    const warns   = db?.warns    || 0;
    const isPrem  = db?.premium  || false;

    const now = new Date().toLocaleString('en-ZA', {
      timeZone: config.timezone || 'Africa/Harare',
      day: 'numeric', month: 'short', year: 'numeric',
    });

    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(target, 'image');
    } catch {
      ppUrl = null;
    }

    const badge = isPrem ? '💸 Premium' : '🆓 Free';
    const warnBar = warns === 0 ? '🟢 Clean' : warns < 3 ? `🟡 ${warns} warn(s)` : `🔴 ${warns} warn(s)`;

    const profileText =
      `╔═══════════════════════╗\n` +
      `   👤 *USER PROFILE CARD*   \n` +
      `╚═══════════════════════╝\n\n` +
      `📱 Number  : *+${num}*\n` +
      `🏷️  Plan    : *${badge}*\n` +
      `⚠️  Warns   : ${warnBar}\n\n` +
      `━━━ 📊 Stats ━━━\n` +
      `⭐ XP       : *${fmtNum(xp)}* (Level ${level})\n` +
      `💬 Commands : *${fmtNum(cmds)}*\n` +
      `💰 Wallet   : *${fmtNum(wallet)} coins*\n\n` +
      `📅 Checked  : ${now}\n\n` +
      `_⚡ ${config.botName}_`;

    if (ppUrl) {
      await sock.sendMessage(from, {
        image: { url: ppUrl },
        caption: profileText,
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: profileText }, { quoted: msg });
    }
  },
};
