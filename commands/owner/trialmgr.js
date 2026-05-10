/**
 * ⚡ NovaSpark Bot v11.1 — Trial Manager (Owner-only)
 *
 * .trial        — Show trial status
 * .trial extend 7  — Extend trial by 7 days
 * .trial reset     — Reset trial to start from now (new 7 days)
 * .trial check @user — Check if a user is premium or within trial
 */
'use strict';

const trial   = require('../../utils/trial');
const config  = require('../../config');

module.exports = {
  name:    'trial',
  aliases: ['licence', 'license', 'trialmgr'],
  category: 'owner',
  desc:    'Manage bot trial & premium (owner only)',
  usage:   '.trial | .trial extend <days> | .trial reset | .trial check @user',
  ownerOnly: true,
  async execute({ sock, msg, args, from, sender, isOwner }) {
    if (!isOwner) {
      return sock.sendMessage(from, { text: '❌ This command is for the bot owner only.' }, { quoted: msg });
    }

    const sub = (args[0] || '').toLowerCase();

    // ── .trial (status) ──────────────────────────────────────────────────────
    if (!sub || sub === 'status') {
      const active   = trial.isTrialActive();
      const daysLeft = trial.getTrialDaysLeft();
      const expiry   = trial.getTrialExpiryDate();
      const premList = [...trial.PREMIUM_NUMBERS].join(', ');

      return sock.sendMessage(from, {
        text: `⚡ *NovaSpark Bot — Trial Status*\n\n` +
              `📊 Status: ${active ? `✅ *ACTIVE* (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)` : '❌ *EXPIRED*'}\n` +
              `📅 Expires: ${expiry}\n` +
              `⏳ Trial duration: ${trial.TRIAL_DAYS} days\n\n` +
              `👑 *Premium Numbers* (never expire):\n${[...trial.PREMIUM_NUMBERS].map(n => `  • ${n}`).join('\n')}\n\n` +
              `_Use .trial extend <days> to add more time_\n` +
              `_Use .trial reset to restart the 7-day trial_`,
      }, { quoted: msg });
    }

    // ── .trial extend <days> ─────────────────────────────────────────────────
    if (sub === 'extend') {
      const days = parseInt(args[1]);
      if (isNaN(days) || days < 1) {
        return sock.sendMessage(from, { text: '❌ Usage: `.trial extend <days>`\nExample: `.trial extend 7`' }, { quoted: msg });
      }
      trial.extendTrial(days);
      const newExpiry = trial.getTrialExpiryDate();
      return sock.sendMessage(from, {
        text: `✅ *Trial extended by ${days} day${days !== 1 ? 's' : ''}!*\n\n📅 New expiry: ${newExpiry}\n⏳ Days left: ${trial.getTrialDaysLeft()}`,
      }, { quoted: msg });
    }

    // ── .trial reset ─────────────────────────────────────────────────────────
    if (sub === 'reset') {
      const fs   = require('fs');
      const path = require('path');
      const trialFile = path.join(__dirname, '..', '..', 'database', 'trial.json');
      try {
        fs.writeFileSync(trialFile, JSON.stringify({ startedAt: Date.now(), extendedDays: 0 }, null, 2));
      } catch {}
      // Force reload by re-requiring
      delete require.cache[require.resolve('../../utils/trial')];
      const newExpiry = trial.getTrialExpiryDate();
      return sock.sendMessage(from, {
        text: `✅ *Trial reset!* New 7-day trial started.\n📅 Expires: ${newExpiry}`,
      }, { quoted: msg });
    }

    // ── .trial check @user ───────────────────────────────────────────────────
    if (sub === 'check') {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (args[1] && args[1].replace('@', '') + '@s.whatsapp.net');
      if (!mentioned) {
        return sock.sendMessage(from, { text: '❌ Mention a user to check.\nUsage: `.trial check @user`' }, { quoted: msg });
      }
      const isPrem  = trial.isPremiumNumber(mentioned);
      const access  = trial.isBotAllowed(mentioned);
      const num     = mentioned.split('@')[0];
      return sock.sendMessage(from, {
        text: `🔍 *User Check: ${num}*\n\n` +
              `👑 Premium: ${isPrem ? '✅ YES (never expires)' : '❌ No'}\n` +
              `✅ Bot access: ${access.allowed ? `Yes (${access.daysLeft ?? '∞'} day${access.daysLeft !== 1 ? 's' : ''} left)` : `❌ Blocked — trial expired`}`,
        mentions: [mentioned],
      }, { quoted: msg });
    }

    // Fallback
    await sock.sendMessage(from, {
      text: '⚡ *Trial Manager*\n\n' +
            '• `.trial` — Show trial status\n' +
            '• `.trial extend 7` — Extend by N days\n' +
            '• `.trial reset` — Restart trial from now\n' +
            '• `.trial check @user` — Check a user\'s access',
    }, { quoted: msg });
  },
};
