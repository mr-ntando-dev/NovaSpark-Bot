/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .waprotect — WhatsApp Account Protection Suite (Owner Only)
 *
 * New features in v10:
 * ✅ Link detection — auto-block DM link senders
 * ✅ Custom keyword list — add/remove your own scam keywords
 * ✅ Whitelist — trusted numbers bypass all protection
 * ✅ Auto-block vs warn-only mode toggle
 * ✅ Warn-first mode — warn on 1st offence, block on 2nd
 * ✅ Stats tracker — see how many threats were blocked
 * ✅ Reset stats command
 * ✅ clearwarn command (single number or all)
 * ✅ View built-in keyword list
 *
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_FILE  = path.resolve(__dirname, '../../data/waprotect.json');
const STATS_FILE = path.resolve(__dirname, '../../data/waprotect_stats.json');

const BUILTIN_SCAM_KEYWORDS = [
  'send me money', 'i need your help urgently', 'click this link', 'free airtime',
  'you have won', 'prize claim', 'your account will be suspended', 'verify your account',
  'send your pin', 'otp code', 'bank details', 'western union', 'bitcoin investment',
  'double your money', 'limited time offer', 'act now', 'wire transfer',
  'nigerian prince', 'inheritance', 'lottery winner', 'unclaimed funds',
  'send your password', 'click here to claim', 'congratulations you have been selected',
  'your phone has been hacked', 'urgent reply needed', 'do not share this code',
  'free money', 'make money fast', 'earn from home',
];

const LINK_PATTERN = /https?:\/\/[^\s]+|bit\.ly\/|tinyurl\.com\/|t\.me\/|wa\.me\//i;
const DM_FLOOD_WINDOW_MS = 60 * 1000;
const DM_FLOOD_LIMIT     = 10;
const dmFloodMap = new Map();

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return defaultState();
    return { ...defaultState(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  } catch { return defaultState(); }
}
function defaultState() {
  return {
    enabled: false, blockScam: true, blockFlood: true, blockLinks: false,
    privacyLock: false, alertOwner: true, autoBlock: true,
    customKeywords: [], whitelist: [], warnBeforeBlock: false, warnedUsers: {},
  };
}
function writeState(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}
function readStats() {
  try {
    if (!fs.existsSync(STATS_FILE)) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')) };
  } catch { return defaultStats(); }
}
function defaultStats() {
  return { scamBlocked: 0, floodBlocked: 0, linkBlocked: 0, totalBlocked: 0, lastReset: Date.now() };
}
function bumpStat(key) {
  const s = readStats();
  s[key]  = (s[key] || 0) + 1;
  s.totalBlocked = (s.totalBlocked || 0) + 1;
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATS_FILE, JSON.stringify(s, null, 2));
}
async function applyPrivacyLock(sock) {
  try { await sock.updateLastSeenPrivacy('contacts'); }      catch {}
  try { await sock.updateOnlinePrivacy('match_last_seen'); } catch {}
  try { await sock.updateProfilePicturePrivacy('contacts'); }catch {}
  try { await sock.updateStatusPrivacy('contacts'); }        catch {}
  try { await sock.updateReadReceiptsPrivacy('all'); }       catch {}
  try { await sock.updateGroupsAddPrivacy('contacts'); }     catch {}
}

const state = readState();

async function checkDMProtection(sock, msg, from, body, senderNorm, ownerJid) {
  const s = readState();
  if (!s.enabled) return false;
  if (!from || from.endsWith('@g.us')) return false;

  const senderNum = from.split('@')[0];

  // ── Never block an owner ──────────────────────────────────────────────────
  const config = require('../../config');
  const ownerNums = (Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber])
    .map(n => String(n).replace(/\D/g, ''));
  if (ownerNums.includes(senderNum.replace(/\D/g, ''))) return false;

  if ((s.whitelist || []).some(w => w === senderNum || w === from)) return false;

  const lowerBody   = (body || '').toLowerCase();
  const allKeywords = [...BUILTIN_SCAM_KEYWORDS, ...(s.customKeywords || [])];

  // Scam keyword detection
  if (s.blockScam) {
    const matched = allKeywords.find(kw => lowerBody.includes(kw.toLowerCase()));
    if (matched) {
      if (s.warnBeforeBlock) {
        const warned = s.warnedUsers || {};
        if (!warned[from]) {
          warned[from] = 1;
          writeState({ ...s, warnedUsers: warned });
          try { await sock.sendMessage(from, { text: `⚠️ *WA Protection Warning*\nMessage flagged as scam/spam. Keyword: "${matched}"\n\n⛔ Second violation = block.` }); } catch {}
          if (s.alertOwner && ownerJid) { try { await sock.sendMessage(ownerJid, { text: `🔔 *WA Protection — Warned (not blocked)*\nFrom: +${senderNum}\nKeyword: "${matched}"\nMsg: ${(body||'').slice(0,200)}` }); } catch {} }
          bumpStat('scamBlocked');
          return true;
        }
      }
      if (s.autoBlock) { try { await sock.updateBlockStatus(from, 'block'); } catch {} }
      try { await sock.sendMessage(from, { text: `🛡️ *WA Protection:* Message flagged as spam/scam.\nKeyword: "${matched}"\n\nContact the owner if this was a mistake.` }); } catch {}
      if (s.alertOwner && ownerJid) { try { await sock.sendMessage(ownerJid, { text: `🚨 *WA Protection Alert*\nAction: Scam DM ${s.autoBlock ? 'blocked & user blocked' : 'blocked (warn mode)'}\nFrom: +${senderNum}\nKeyword: "${matched}"\nMsg: ${(body||'').slice(0,200)}` }); } catch {} }
      bumpStat('scamBlocked');
      return true;
    }
  }

  // Link detection
  if (s.blockLinks && LINK_PATTERN.test(body || '')) {
    if (s.autoBlock) { try { await sock.updateBlockStatus(from, 'block'); } catch {} }
    try { await sock.sendMessage(from, { text: `🛡️ *WA Protection:* Unsolicited links are not allowed in DMs. You have been ${s.autoBlock ? 'blocked' : 'flagged'}.` }); } catch {}
    if (s.alertOwner && ownerJid) { try { await sock.sendMessage(ownerJid, { text: `🔗 *WA Protection — Link DM Blocked*\nFrom: +${senderNum}\nMsg: ${(body||'').slice(0,200)}` }); } catch {} }
    bumpStat('linkBlocked');
    return true;
  }

  // DM Flood detection
  if (s.blockFlood) {
    const now   = Date.now();
    const entry = dmFloodMap.get(from) || { count: 0, resetAt: now + DM_FLOOD_WINDOW_MS };
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + DM_FLOOD_WINDOW_MS; }
    entry.count++;
    dmFloodMap.set(from, entry);
    if (entry.count > DM_FLOOD_LIMIT) {
      if (s.autoBlock) { try { await sock.updateBlockStatus(from, 'block'); } catch {} }
      try { await sock.sendMessage(from, { text: `🛡️ *WA Protection:* Too many messages. You have been ${s.autoBlock ? 'blocked' : 'flagged'} for DM flooding.` }); } catch {}
      if (s.alertOwner && ownerJid) { try { await sock.sendMessage(ownerJid, { text: `🌊 *WA Protection — DM Flood Blocked*\nFrom: +${senderNum}\nMessages: ${entry.count} in 1 minute` }); } catch {} }
      bumpStat('floodBlocked');
      return true;
    }
  }

  return false;
}

module.exports = {
  name: 'waprotect',
  aliases: ['wap', 'accountprotect', 'protect'],
  category: 'owner',
  description: 'WhatsApp account protection suite — scam, flood, link, keyword, whitelist, stats',
  usage: '.waprotect on|off|status|privacy|scam|flood|links|block|warn|keyword|whitelist|clearwarn|stats|resetstats',
  ownerOnly: true,

  // Expose for handler.js
  waprotectState: state,
  checkDMProtection,

  async execute({ sock, args, reply }) {
    const sub  = (args[0] || '').toLowerCase();
    const sub2 = (args[1] || '').toLowerCase();
    const s    = readState();

    if (!sub || sub === 'status') {
      return reply(
        `🛡️ *WA Account Protection v10*\n` +
        `${'━'.repeat(32)}\n\n` +
        `⚡ *Main Switch:*     ${s.enabled          ? '🟢 ON' : '🔴 OFF'}\n` +
        `🔍 *Scam Block:*      ${s.blockScam        ? '🟢 ON' : '🔴 OFF'}\n` +
        `🌊 *Flood Block:*     ${s.blockFlood       ? '🟢 ON' : '🔴 OFF'}\n` +
        `🔗 *Link Block:*      ${s.blockLinks       ? '🟢 ON' : '🔴 OFF'}\n` +
        `🔒 *Privacy Lock:*    ${s.privacyLock      ? '🟢 ON' : '🔴 OFF'}\n` +
        `🔔 *Owner Alert:*     ${s.alertOwner       ? '🟢 ON' : '🔴 OFF'}\n` +
        `⛔ *Auto-Block:*      ${s.autoBlock        ? '🟢 ON' : '🟡 WARN only'}\n` +
        `⚠️  *Warn-First Mode:* ${s.warnBeforeBlock  ? '🟢 ON' : '🔴 OFF'}\n\n` +
        `📋 Keywords: ${BUILTIN_SCAM_KEYWORDS.length} built-in + ${s.customKeywords?.length || 0} custom\n` +
        `✅ Whitelist: ${s.whitelist?.length || 0} number(s)\n` +
        `⚠️  Warned users: ${Object.keys(s.warnedUsers || {}).length}\n\n` +
        `📋 *Commands:*\n` +
        `• .waprotect on/off\n` +
        `• .waprotect scam/flood/links/privacy/alert on/off\n` +
        `• .waprotect block on/off  _(auto-block vs warn)_\n` +
        `• .waprotect warn on/off   _(warn-first mode)_\n` +
        `• .waprotect keyword add/remove/list/builtin\n` +
        `• .waprotect whitelist add/remove/list\n` +
        `• .waprotect clearwarn [number]\n` +
        `• .waprotect stats  /  resetstats\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    if (sub === 'on' || sub === 'off') {
      const enabled = sub === 'on';
      writeState({ ...s, enabled });
      state.enabled = enabled;
      if (enabled && s.privacyLock) await applyPrivacyLock(sock);
      return reply(`🛡️ *WA Protection ${enabled ? 'ON 🟢' : 'OFF 🔴'}*\n_${enabled ? 'Scam blocking, flood detection, link filter and alerts active.' : 'All protection features disabled.'}_`);
    }

    if (sub === 'privacy') {
      const on = sub2 === 'on';
      writeState({ ...s, privacyLock: on });
      if (on) { await applyPrivacyLock(sock); return reply('🔒 *Privacy Lock ON* — Last seen, profile pic, status & groups set to Contacts only.'); }
      return reply('🔒 *Privacy Lock OFF* — Privacy settings unchanged.');
    }

    if (sub === 'scam')  { const on = sub2 !== 'off'; writeState({ ...s, blockScam:  on }); return reply(`🔍 *Scam Block ${on ? 'ON 🟢' : 'OFF 🔴'}*`); }
    if (sub === 'flood') { const on = sub2 !== 'off'; writeState({ ...s, blockFlood: on }); return reply(`🌊 *Flood Block ${on ? 'ON 🟢' : 'OFF 🔴'}*`); }
    if (sub === 'links' || sub === 'link') { const on = sub2 !== 'off'; writeState({ ...s, blockLinks: on }); return reply(`🔗 *Link Block ${on ? 'ON 🟢 — Unsolicited links in DMs will be blocked.' : 'OFF 🔴'}*`); }
    if (sub === 'alert') { const on = sub2 !== 'off'; writeState({ ...s, alertOwner: on }); return reply(`🔔 *Owner Alert ${on ? 'ON 🟢' : 'OFF 🔴'}*`); }
    if (sub === 'block') { const on = sub2 !== 'off'; writeState({ ...s, autoBlock: on }); return reply(`⛔ *Auto-Block ${on ? 'ON 🟢 — offenders blocked immediately.' : 'OFF 🟡 — warn-only mode.'}*`); }
    if (sub === 'warn')  { const on = sub2 !== 'off'; writeState({ ...s, warnBeforeBlock: on }); return reply(`⚠️ *Warn-First Mode ${on ? 'ON 🟢 — warning 1st, block on 2nd offence.' : 'OFF 🔴 — immediate action.'}*`); }

    // keyword management
    if (sub === 'keyword' || sub === 'kw') {
      const action  = sub2;
      const keyword = args.slice(2).join(' ').toLowerCase().trim();

      if (action === 'list') {
        const custom = s.customKeywords || [];
        if (!custom.length) return reply(`🔍 *Custom Keywords (0)*\n\nNo custom keywords yet. Built-in: ${BUILTIN_SCAM_KEYWORDS.length}\n\nUse: .waprotect keyword add <phrase>\n\n_⚡ NovaSpark Bot_`);
        return reply(`🔍 *Custom Keywords (${custom.length})*\n${'━'.repeat(28)}\n\n${custom.map((k,i)=>`${i+1}. ${k}`).join('\n')}\n\n_Built-in: ${BUILTIN_SCAM_KEYWORDS.length}_\n_⚡ NovaSpark Bot_`);
      }
      if (action === 'builtin' || action === 'default') {
        const preview = BUILTIN_SCAM_KEYWORDS.map((k,i)=>`${i+1}. ${k}`).join('\n');
        return reply(`🔍 *Built-in Keywords (${BUILTIN_SCAM_KEYWORDS.length})*\n${'━'.repeat(28)}\n\n${preview}\n\n_⚡ NovaSpark Bot_`);
      }
      if (action === 'add') {
        if (!keyword) return reply('❌ Provide a keyword. Example: .waprotect keyword add free money');
        const custom = s.customKeywords || [];
        if (custom.includes(keyword)) return reply(`⚠️ Already in list: "${keyword}"`);
        custom.push(keyword);
        writeState({ ...s, customKeywords: custom });
        return reply(`✅ *Keyword added:* "${keyword}" (total custom: ${custom.length})`);
      }
      if (action === 'remove' || action === 'rm' || action === 'del') {
        if (!keyword) return reply('❌ Provide a keyword to remove.');
        const custom = s.customKeywords || [];
        const idx    = custom.indexOf(keyword);
        if (idx === -1) return reply(`❌ Not found: "${keyword}"`);
        custom.splice(idx, 1);
        writeState({ ...s, customKeywords: custom });
        return reply(`🗑️ *Keyword removed:* "${keyword}" (total custom: ${custom.length})`);
      }
      return reply(`🔍 *Keyword Manager*\n• .waprotect keyword add <phrase>\n• .waprotect keyword remove <phrase>\n• .waprotect keyword list\n• .waprotect keyword builtin\n\n_⚡ NovaSpark Bot_`);
    }

    // whitelist management
    if (sub === 'whitelist' || sub === 'wl') {
      const action = sub2;
      const num    = (args[2] || '').replace(/[^0-9]/g, '');

      if (action === 'list') {
        const wl = s.whitelist || [];
        if (!wl.length) return reply(`✅ *Whitelist is empty*\n\nAdd with: .waprotect whitelist add <number>\n\n_⚡ NovaSpark Bot_`);
        return reply(`✅ *Whitelisted (${wl.length})*\n${'━'.repeat(28)}\n\n${wl.map((n,i)=>`${i+1}. +${n}`).join('\n')}\n\n_These numbers bypass all protection_\n_⚡ NovaSpark Bot_`);
      }
      if (action === 'add') {
        if (!num) return reply('❌ Provide a phone number. Example: .waprotect whitelist add 263712345678');
        const wl = s.whitelist || [];
        if (wl.includes(num)) return reply(`⚠️ +${num} already whitelisted.`);
        wl.push(num);
        writeState({ ...s, whitelist: wl });
        return reply(`✅ *+${num} whitelisted* — bypasses all WA protection.`);
      }
      if (action === 'remove' || action === 'rm') {
        if (!num) return reply('❌ Provide a number to remove.');
        const wl  = s.whitelist || [];
        const idx = wl.indexOf(num);
        if (idx === -1) return reply(`❌ +${num} is not in whitelist.`);
        wl.splice(idx, 1);
        writeState({ ...s, whitelist: wl });
        return reply(`🗑️ *+${num} removed from whitelist.*`);
      }
      return reply(`✅ *Whitelist Manager*\n• .waprotect whitelist add <number>\n• .waprotect whitelist remove <number>\n• .waprotect whitelist list\n\n_⚡ NovaSpark Bot_`);
    }

    // clearwarn
    if (sub === 'clearwarn') {
      const num = (args[1] || '').replace(/[^0-9]/g, '');
      if (num) {
        const warned = s.warnedUsers || {};
        const jid    = `${num}@s.whatsapp.net`;
        if (!warned[jid] && !warned[num]) return reply(`❌ No warning record for +${num}.`);
        delete warned[jid]; delete warned[num];
        writeState({ ...s, warnedUsers: warned });
        return reply(`✅ *Warnings cleared for +${num}*`);
      }
      writeState({ ...s, warnedUsers: {} });
      return reply(`✅ *All WA Protection warnings cleared.*`);
    }

    // stats
    if (sub === 'stats') {
      const st    = readStats();
      const since = new Date(st.lastReset || Date.now()).toLocaleDateString('en-ZA');
      return reply(
        `📊 *WA Protection Stats*\n${'━'.repeat(28)}\n\n` +
        `🔍 Scam DMs blocked:  ${st.scamBlocked  || 0}\n` +
        `🌊 Flood DMs blocked: ${st.floodBlocked || 0}\n` +
        `🔗 Link DMs blocked:  ${st.linkBlocked  || 0}\n` +
        `${'─'.repeat(28)}\n` +
        `🛡️ *Total blocked: ${st.totalBlocked || 0}*\n\n` +
        `📅 Since: ${since}\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    // resetstats
    if (sub === 'resetstats') {
      const dir = path.dirname(STATS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STATS_FILE, JSON.stringify(defaultStats(), null, 2));
      return reply(`🔄 *WA Protection stats reset.*`);
    }

    return reply(`❓ Unknown sub-command: *${sub}*\nUse .waprotect status for all options.\n\n_⚡ NovaSpark Bot_`);
  },
};

// Make sure checkDMProtection is accessible as a named export too
module.exports.checkDMProtection = checkDMProtection;
module.exports.waprotectState    = state;
