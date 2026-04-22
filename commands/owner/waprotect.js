/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * .waprotect — WhatsApp Account Protection Suite (Owner Only)
 *
 * Features:
 * ✅ Auto-reject all incoming calls (already have anticall, this enhances it)
 * ✅ Auto-block users who send suspicious/scam keywords in DMs
 * ✅ Auto-block users who spam the bot in DMs (flood protection)
 * ✅ Privacy lock — auto-sets profile privacy (status/pp/lastseen to contacts)
 * ✅ Alert owner on unknown DM attempts when blocker is ON
 *
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/waprotect.json');

const SCAM_KEYWORDS = [
  'send me money', 'i need your help urgently', 'click this link', 'free airtime',
  'you have won', 'prize claim', 'your account will be suspended', 'verify your account',
  'send your pin', 'otp code', 'bank details', 'western union', 'bitcoin investment',
  'double your money', 'limited time offer', 'act now', 'wire transfer',
  'nigerian prince', 'inheritance', 'lottery winner', 'unclaimed funds',
];

const DM_FLOOD_WINDOW_MS = 60 * 1000; // 1 minute
const DM_FLOOD_LIMIT     = 10;        // max messages per minute from unknown DM

// In-memory DM flood tracker { jid: { count, resetAt } }
const dmFloodMap = new Map();

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return defaultState();
    return { ...defaultState(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  } catch { return defaultState(); }
}
function defaultState() {
  return {
    enabled:       false,
    blockScam:     true,
    blockFlood:    true,
    privacyLock:   false,
    alertOwner:    true,
  };
}
function writeState(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

const state = readState();
module.exports.waprotectState = state;

/**
 * checkDMProtection — called from handler for every non-command private message
 * Returns true if message was blocked (handler should stop processing)
 */
module.exports.checkDMProtection = async function checkDMProtection(sock, msg, from, body, senderNorm, ownerJid) {
  const s = readState();
  if (!s.enabled) return false;
  if (!from || from.endsWith('@g.us')) return false;

  const lowerBody = (body || '').toLowerCase();

  // ── Scam keyword detection ────────────────────────────────────────────────
  if (s.blockScam) {
    const matched = SCAM_KEYWORDS.find(kw => lowerBody.includes(kw));
    if (matched) {
      try {
        await sock.sendMessage(from, {
          text: `🛡️ *WA Protection:* Your message was flagged as potential spam/scam.\n_Keyword matched: "${matched}"_\n\nIf this was a mistake, please contact the owner.`,
        });
        await sock.updateBlockStatus(from, 'block');
      } catch {}
      // Alert owner
      if (s.alertOwner && ownerJid) {
        try {
          await sock.sendMessage(ownerJid, {
            text: `🚨 *WA Protection Alert*\n\n*Action:* Scam DM blocked & user blocked\n*From:* +${from.split('@')[0]}\n*Message:* ${body?.slice(0, 200) || '(no text)'}`,
          });
        } catch {}
      }
      return true;
    }
  }

  // ── DM Flood detection ─────────────────────────────────────────────────────
  if (s.blockFlood) {
    const now   = Date.now();
    const entry = dmFloodMap.get(from) || { count: 0, resetAt: now + DM_FLOOD_WINDOW_MS };
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + DM_FLOOD_WINDOW_MS; }
    entry.count++;
    dmFloodMap.set(from, entry);

    if (entry.count > DM_FLOOD_LIMIT) {
      try {
        await sock.sendMessage(from, {
          text: `🛡️ *WA Protection:* You have been sending too many messages. You have been blocked for spamming.`,
        });
        await sock.updateBlockStatus(from, 'block');
      } catch {}
      if (s.alertOwner && ownerJid) {
        try {
          await sock.sendMessage(ownerJid, {
            text: `🚨 *WA Protection Alert*\n\n*Action:* DM Flood — user blocked\n*From:* +${from.split('@')[0]}\n*Messages:* ${entry.count} in 1 min`,
          });
        } catch {}
      }
      return true;
    }
  }

  return false;
};

/**
 * applyPrivacyLock — sets WA privacy settings to contacts-only
 */
async function applyPrivacyLock(sock) {
  try {
    await sock.updateLastSeenPrivacy('contacts');
    await sock.updateOnlinePrivacy('match_last_seen');
    await sock.updateProfilePicturePrivacy('contacts');
    await sock.updateStatusPrivacy('contacts');
    await sock.updateReadReceiptsPrivacy('all');
    await sock.updateGroupsAddPrivacy('contacts');
  } catch {}
}

module.exports = {
  name: 'waprotect',
  aliases: ['wap', 'accountprotect', 'protect'],
  category: 'owner',
  description: 'WhatsApp account protection suite — scam block, flood block, privacy lock',
  usage: '.waprotect on | off | status | privacy on/off | scam on/off | flood on/off',
  ownerOnly: true,

  async execute({ sock, args, reply }) {
    const sub  = (args[0] || '').toLowerCase();
    const sub2 = (args[1] || '').toLowerCase();
    const s    = readState();

    if (!sub || sub === 'status') {
      return reply(
        `🛡️ *WA Account Protection*\n` +
        `${'━'.repeat(30)}\n\n` +
        `⚡ *Status:*       ${s.enabled      ? '🟢 ON'  : '🔴 OFF'}\n` +
        `🔍 *Scam Block:*   ${s.blockScam    ? '🟢 ON'  : '🔴 OFF'}\n` +
        `🌊 *Flood Block:*  ${s.blockFlood   ? '🟢 ON'  : '🔴 OFF'}\n` +
        `🔒 *Privacy Lock:* ${s.privacyLock  ? '🟢 ON'  : '🔴 OFF'}\n` +
        `🔔 *Owner Alert:*  ${s.alertOwner   ? '🟢 ON'  : '🔴 OFF'}\n\n` +
        `📋 *Commands:*\n` +
        `• .waprotect on/off\n` +
        `• .waprotect scam on/off\n` +
        `• .waprotect flood on/off\n` +
        `• .waprotect privacy on/off\n` +
        `• .waprotect alert on/off\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'on' || sub === 'off') {
      const enabled = sub === 'on';
      writeState({ ...s, enabled });
      state.enabled = enabled;
      if (enabled && s.privacyLock) await applyPrivacyLock(sock);
      return reply(`🛡️ *WA Protection ${enabled ? 'ON 🟢' : 'OFF 🔴'}*\n_${enabled ? 'Scam blocking, flood detection and alerts are active.' : 'All protection features disabled.'}_`);
    }

    if (sub === 'privacy') {
      const on = sub2 === 'on';
      writeState({ ...s, privacyLock: on });
      if (on) {
        await applyPrivacyLock(sock);
        return reply('🔒 *Privacy Lock ON* — Last seen, profile pic, status & groups privacy set to Contacts only.');
      }
      return reply('🔒 *Privacy Lock OFF* — Privacy settings left as-is.');
    }

    if (sub === 'scam') {
      const on = sub2 !== 'off';
      writeState({ ...s, blockScam: on });
      return reply(`🔍 *Scam Block ${on ? 'ON 🟢' : 'OFF 🔴'}*`);
    }

    if (sub === 'flood') {
      const on = sub2 !== 'off';
      writeState({ ...s, blockFlood: on });
      return reply(`🌊 *Flood Block ${on ? 'ON 🟢' : 'OFF 🔴'}*`);
    }

    if (sub === 'alert') {
      const on = sub2 !== 'off';
      writeState({ ...s, alertOwner: on });
      return reply(`🔔 *Owner Alert ${on ? 'ON 🟢' : 'OFF 🔴'}*`);
    }

    return reply('❓ Usage: `.waprotect on | off | status | privacy on/off | scam on/off | flood on/off | alert on/off`');
  },
};
