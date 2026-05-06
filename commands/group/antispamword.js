/**
 * ⚡ NovaSpark Bot v11 — .antispamword
 * Smart word-frequency spam detector. Detects copy-paste spam and
 * repetitive-phrase flooding that antiflood misses. Per-group.
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

// ── Per-group word-frequency windows ─────────────────────────────────────────
// Track: { jid: { sender: { word: count[], lastFlush: ts } } }
const _wordMap  = new Map();
const WINDOW_MS = 30_000; // 30 second rolling window
const DEF_THRESHOLD = 5;  // same word from same user more than 5x in window

function getSettings(gid) {
  const gs = database.getGroupSettings(gid);
  return {
    enabled:   gs.antispamword || false,
    threshold: gs.antispamwordThreshold || DEF_THRESHOLD,
    action:    gs.antispamwordAction || 'warn', // 'warn' | 'delete' | 'kick'
  };
}

function checkSpam(gid, sender, text) {
  if (!text || text.length < 4) return null;

  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  if (!words.length) return null;

  if (!_wordMap.has(gid)) _wordMap.set(gid, new Map());
  const gMap = _wordMap.get(gid);

  if (!gMap.has(sender)) gMap.set(sender, { words: {}, lastMsg: '', dupeCount: 0, lastFlush: Date.now() });
  const sData = gMap.get(sender);

  // Flush old window
  if (Date.now() - sData.lastFlush > WINDOW_MS) {
    sData.words     = {};
    sData.dupeCount = 0;
    sData.lastFlush = Date.now();
  }

  // Detect exact message duplication
  if (sData.lastMsg === text.trim()) {
    sData.dupeCount++;
    if (sData.dupeCount >= 3) return { type: 'dupe', word: '[exact message repeated]', count: sData.dupeCount };
  } else {
    sData.dupeCount = 0;
  }
  sData.lastMsg = text.trim();

  // Detect high-frequency word
  for (const w of words) {
    sData.words[w] = (sData.words[w] || 0) + 1;
  }

  const threshold = database.getGroupSettings(gid).antispamwordThreshold || DEF_THRESHOLD;
  for (const [w, c] of Object.entries(sData.words)) {
    if (c >= threshold) return { type: 'word', word: w, count: c };
  }

  return null;
}

// ── Export the real-time check function for use in handler.js ─────────────────
module.exports.checkSpam = checkSpam;

module.exports = {
  name:        'antispamword',
  aliases:     ['wordspam', 'spamword', 'antispam2'],
  category:    'group',
  description: 'Smart word-frequency spam detector — catches copy-paste & repetitive flooding',
  usage:       '.antispamword on/off  |  .antispamword threshold <N>  |  .antispamword action warn/delete/kick',
  adminOnly:   true,

  execute: async ({ sock, msg, from, args, reply, groupSettings, isAdmin, isBotAdmin }) => {
    if (!from.endsWith('@g.us')) return reply('⚠️ This command is for groups only.');

    const sub = (args[0] || '').toLowerCase();
    const gs  = database.getGroupSettings(from);

    if (!sub || sub === 'status') {
      const { enabled, threshold, action } = getSettings(from);
      return reply([
        `🔤 *Anti-Spam Word Filter*`,
        `━━━━━━━━━━━━━━━━━━━━━━━`,
        `Status:    ${enabled ? '✅ *ON*' : '❌ *OFF*'}`,
        `Threshold: *${threshold}* same-word occurrences in 30s`,
        `Action:    *${action}* (warn / delete / kick)`,
        ``,
        `*Commands:*`,
        `  \`.antispamword on\` — enable`,
        `  \`.antispamword off\` — disable`,
        `  \`.antispamword threshold 4\` — set sensitivity`,
        `  \`.antispamword action delete\` — set action`,
      ].join('\n'));
    }

    if (sub === 'on') {
      database.updateGroupSettings(from, { antispamword: true });
      return reply('✅ Anti-Spam Word Filter *enabled*.\n\nUsers who repeat the same word/phrase excessively will be caught.');
    }

    if (sub === 'off') {
      database.updateGroupSettings(from, { antispamword: false });
      return reply('❌ Anti-Spam Word Filter *disabled*.');
    }

    if (sub === 'threshold') {
      const n = parseInt(args[1]);
      if (!n || n < 2 || n > 20) return reply('Usage: `.antispamword threshold <2-20>`');
      database.updateGroupSettings(from, { antispamwordThreshold: n });
      return reply(`✅ Threshold set to *${n}* repetitions in 30 seconds.`);
    }

    if (sub === 'action') {
      const act = args[1];
      if (!['warn','delete','kick'].includes(act)) return reply('Usage: `.antispamword action warn/delete/kick`');
      database.updateGroupSettings(from, { antispamwordAction: act });
      const desc = { warn: 'send a warning', delete: 'delete the message', kick: 'remove the spammer' }[act];
      return reply(`✅ Action set to *${act}* — bot will ${desc} when spam is detected.`);
    }

    return reply('Unknown sub-command. Try `.antispamword status`');
  },
};
