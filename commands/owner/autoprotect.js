/**
 * ⚡ NovaSpark Bot v7 — AutoProtect
 * Master WA protection suite — AUTO-STARTS when bot goes online
 * Bundles: privacy lock, anti-call, anti-scam DM, status read, PM blocker
 *
 * Also exposes: module.exports.onBotOnline(sock) — called from index.js
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const config = require('../../config');

const DATA_FILE = path.resolve(__dirname, '../../data/autoprotect.json');

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return defaultState();
    return { ...defaultState(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  } catch { return defaultState(); }
}
function defaultState() {
  return {
    privacyLock:    true,   // auto-set profile/status/pp to contacts
    antiCallAuto:   true,   // auto-reject all calls
    antiScamDM:     true,   // block scam DM senders instantly
    autoReadStatus: false,  // auto-read all statuses (view others silently)
    antiGhost:      false,  // alert owner when someone screenshots (not detectable in WA — placeholder)
    blockStrangers: false,  // block anyone not in contacts who DMs
  };
}
function writeState(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

const SCAM_KW = [
  'send me money','urgent help','click this link','free airtime','you have won',
  'prize claim','verify your account','send your pin','otp code','bank details',
  'bitcoin investment','double your money','wire transfer','inheritance',
  'lottery winner','unclaimed funds','nigerian prince','western union',
];

/**
 * Called automatically from index.js when bot connects
 */
module.exports.onBotOnline = async function onBotOnline(sock) {
  const s = readState();
  const ownerJid = `${config.ownerNumber[0]}@s.whatsapp.net`;

  // 1. Privacy Lock — set privacy to contacts-only
  if (s.privacyLock) {
    try {
      await sock.updateLastSeenPrivacy('contacts');
      await sock.updateOnlinePrivacy('match_last_seen');
      await sock.updateProfilePicturePrivacy('contacts');
      await sock.updateStatusPrivacy('contacts');
      await sock.updateReadReceiptsPrivacy('all');
      console.log('[AutoProtect] ✅ Privacy Lock applied');
    } catch (e) {
      console.warn('[AutoProtect] Privacy Lock partial:', e.message);
    }
  }

  // 2. Notify owner that auto-protect is active
  try {
    await sock.sendMessage(ownerJid, {
      text:
        `🛡️ *AutoProtect — NovaSpark Online*\n\n` +
        `✅ Privacy Lock     : ${s.privacyLock    ? 'ON' : 'OFF'}\n` +
        `✅ Anti-Call Auto   : ${s.antiCallAuto   ? 'ON' : 'OFF'}\n` +
        `✅ Anti-Scam DM     : ${s.antiScamDM     ? 'ON' : 'OFF'}\n` +
        `✅ Auto-Read Status : ${s.autoReadStatus ? 'ON' : 'OFF'}\n` +
        `✅ Block Strangers  : ${s.blockStrangers ? 'ON' : 'OFF'}\n\n` +
        `_NovaSpark is now fully protected and online._`,
    });
  } catch {}
};

/**
 * checkCall — called from handler on calls.upsert
 */
module.exports.checkCall = async function checkCall(sock, call) {
  const s = readState();
  if (!s.antiCallAuto) return;
  try {
    await sock.rejectCall(call.id, call.from);
    const ownerJid = `${config.ownerNumber[0]}@s.whatsapp.net`;
    await sock.sendMessage(ownerJid, {
      text: `📵 *AutoProtect:* Rejected call from +${call.from.split('@')[0]}`,
    });
  } catch {}
};

/**
 * checkDM — called from handler for private messages
 */
module.exports.checkDM = async function checkDM(sock, msg, from, body) {
  const s = readState();
  if (!body || from.endsWith('@g.us')) return false;

  const ownerJid  = `${config.ownerNumber[0]}@s.whatsapp.net`;
  const lowerBody = body.toLowerCase();

  // Anti-scam DM
  if (s.antiScamDM) {
    const matched = SCAM_KW.find(kw => lowerBody.includes(kw));
    if (matched) {
      try {
        await sock.sendMessage(from, {
          text: `🛡️ Your message was flagged as potential scam. Contact the owner directly if legitimate.`,
        });
        await sock.updateBlockStatus(from, 'block');
        await sock.sendMessage(ownerJid, {
          text: `🚨 *AutoProtect — Scam DM blocked*\n*From:* +${from.split('@')[0]}\n*Keyword:* "${matched}"\n*Msg:* ${body.slice(0, 200)}`,
        });
      } catch {}
      return true;
    }
  }

  // Block strangers
  if (s.blockStrangers) {
    if (from !== ownerJid) {
      try {
        await sock.sendMessage(from, {
          text: `⚠️ DMs are not accepted. Please join an official NovaSpark group.`,
        });
      } catch {}
      return true;
    }
  }

  return false;
};

// Command interface for owner
module.exports = {
  ...module.exports,

  name: 'autoprotect',
  aliases: ['autoprotectmode', 'waprotect2'],
  category: 'owner',
  description: 'Master WA auto-protection suite (auto-starts on bot online)',
  usage: '.autoprotect status | set <feature> on/off',
  ownerOnly: true,

  async execute({ sock, msg, from, args, reply }) {
    try {
      const s   = readState();
      const opt = (args[0] || '').toLowerCase();

      if (!opt || opt === 'status') {
        return reply(
          `🛡️ *AutoProtect — NovaSpark*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `🔒 Privacy Lock     : *${s.privacyLock    ? '🟢 ON' : '🔴 OFF'}*\n` +
          `📵 Anti-Call Auto   : *${s.antiCallAuto   ? '🟢 ON' : '🔴 OFF'}*\n` +
          `🚨 Anti-Scam DM     : *${s.antiScamDM     ? '🟢 ON' : '🔴 OFF'}*\n` +
          `👁️ Auto-Read Status : *${s.autoReadStatus ? '🟢 ON' : '🔴 OFF'}*\n` +
          `🚷 Block Strangers  : *${s.blockStrangers ? '🟢 ON' : '🔴 OFF'}*\n\n` +
          `_All features auto-start when bot goes online._\n\n` +
          `Use: .autoprotect set privacy on/off\n` +
          `     .autoprotect set anticall on/off\n` +
          `     .autoprotect set antiscam on/off\n` +
          `     .autoprotect set readstatus on/off\n` +
          `     .autoprotect set blockstrangers on/off`
        );
      }

      if (opt === 'set' && args[1] && args[2]) {
        const feature = args[1].toLowerCase();
        const val     = args[2].toLowerCase() === 'on';
        const map = {
          privacy:        'privacyLock',
          anticall:       'antiCallAuto',
          antiscam:       'antiScamDM',
          readstatus:     'autoReadStatus',
          blockstrangers: 'blockStrangers',
        };
        const key = map[feature];
        if (!key) return reply(`❌ Unknown feature. Valid: privacy | anticall | antiscam | readstatus | blockstrangers`);
        s[key] = val;
        writeState(s);
        return reply(`✅ *${feature}* set to *${val ? 'ON' : 'OFF'}*.\n_Will apply on next bot restart._`);
      }

      return reply('❓ Usage: `.autoprotect status` or `.autoprotect set <feature> on/off`');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
