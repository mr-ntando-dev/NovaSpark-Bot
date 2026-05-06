/**
 * ⚡ NovaSpark Bot v11 — .groupclone
 * Export a full snapshot of this group's NovaSpark settings as a
 * shareable code. Use .groupclone restore <code> to apply to another group.
 * Owner/admin only.
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

// ── Which settings to include in the clone ────────────────────────────────────
const CLONE_KEYS = [
  'antilink','antispam','antitoxic','antiflood','antiraid','antiword',
  'antifwd','antifake','antiimage','antivideo','antisticker','antimedia',
  'antibadword','wordlist',
  'welcome','welcomeMsg','goodbye','goodbyeMsg',
  'nightmode','nightStart','nightEnd',
  'vipmode','vipList',
  'slowmode','slowDelay',
  'setwarnlimit','warnLimit',
  'grouprules','rules',
  'autoreact','autoreactMode',
  'autoreply','autoreplyMsg',
  'ghostmode','autokick','autonudge',
  'aiwelcome','smartmod',
  'antispamword','antispamwordThreshold','antispamwordAction',
  'autoquiz','quizTime',
];

function compress(obj) {
  const json = JSON.stringify(obj);
  return Buffer.from(json, 'utf-8').toString('base64');
}

function decompress(code) {
  try {
    const json = Buffer.from(code.trim(), 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

module.exports = {
  name:        'groupclone',
  aliases:     ['clonesettings', 'exportgroup', 'groupbackup2', 'clonegroup'],
  category:    'owner',
  description: 'Export/restore all group settings as a portable code (owner/admin only)',
  usage:       '.groupclone export  |  .groupclone restore <code>  |  .groupclone diff <code>',
  adminOnly:   true,

  execute: async ({ sock, msg, from, args, reply, isAdmin }) => {
    if (!from.endsWith('@g.us')) return reply('⚠️ This command works in groups only.');

    const sub = (args[0] || 'export').toLowerCase();

    // ── EXPORT ────────────────────────────────────────────────────────────────
    if (sub === 'export') {
      const gs      = database.getGroupSettings(from);
      const snapshot = {};
      for (const k of CLONE_KEYS) {
        if (gs[k] !== undefined) snapshot[k] = gs[k];
      }
      // Add meta
      snapshot.__meta = {
        exportedAt: new Date().toISOString(),
        botVersion: config.botVersion,
        keys:       Object.keys(snapshot).length - 1,
      };

      const code = compress(snapshot);
      const lines = [
        `📦 *Group Settings Export*`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `✅ Exported *${snapshot.__meta.keys}* settings`,
        `📅 Time: ${new Date().toLocaleString('en-ZA', { timeZone: config.timezone || 'Africa/Harare' })}`,
        ``,
        `*Clone Code:*`,
        `\`\`\``,
        code,
        `\`\`\``,
        ``,
        `_Use \`.groupclone restore <code>\` in another group to apply._`,
        `_Use \`.groupclone diff <code>\` to compare before restoring._`,
      ];
      return reply(lines.join('\n'));
    }

    // ── RESTORE ───────────────────────────────────────────────────────────────
    if (sub === 'restore') {
      const code = args[1];
      if (!code) return reply('Usage: `.groupclone restore <code>`\n\nGet the code from `.groupclone export` in the source group.');
      const snapshot = decompress(code);
      if (!snapshot) return reply('❌ Invalid or corrupted clone code.');

      const meta    = snapshot.__meta || {};
      const toApply = { ...snapshot };
      delete toApply.__meta;

      database.updateGroupSettings(from, toApply);

      return reply([
        `✅ *Group Settings Restored!*`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📦 Applied *${Object.keys(toApply).length}* settings`,
        `📅 Exported: ${meta.exportedAt ? new Date(meta.exportedAt).toLocaleString('en-ZA') : 'Unknown'}`,
        `🤖 Source bot version: ${meta.botVersion || 'Unknown'}`,
        ``,
        `_Some settings (like VIP lists, word lists) may need manual review._`,
        `_Use \`.groupstats\` to verify the applied settings._`,
      ].join('\n'));
    }

    // ── DIFF ─────────────────────────────────────────────────────────────────
    if (sub === 'diff') {
      const code = args[1];
      if (!code) return reply('Usage: `.groupclone diff <code>`');
      const snapshot = decompress(code);
      if (!snapshot) return reply('❌ Invalid or corrupted clone code.');

      const current = database.getGroupSettings(from);
      const toApply = { ...snapshot };
      delete toApply.__meta;

      const same    = [];
      const changed = [];
      const added   = [];

      for (const [k, v] of Object.entries(toApply)) {
        if (current[k] === undefined) {
          added.push(`  ➕ ${k}: → ${JSON.stringify(v).slice(0, 40)}`);
        } else if (JSON.stringify(current[k]) !== JSON.stringify(v)) {
          changed.push(`  🔄 ${k}: ${JSON.stringify(current[k]).slice(0,25)} → ${JSON.stringify(v).slice(0,25)}`);
        } else {
          same.push(k);
        }
      }

      const lines = [
        `🔍 *Settings Diff*`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `✅ Same (${same.length}): ${same.join(', ') || 'none'}`,
      ];
      if (changed.length) { lines.push('', `🔄 *Changed (${changed.length}):*`, ...changed); }
      if (added.length)   { lines.push('', `➕ *New (${added.length}):*`, ...added); }
      lines.push('', `_Run \`.groupclone restore <code>\` to apply._`);
      return reply(lines.join('\n'));
    }

    return reply([
      '📦 *Group Clone*',
      '',
      '`.groupclone export` — export this group\'s settings',
      '`.groupclone restore <code>` — apply settings from code',
      '`.groupclone diff <code>` — compare before restoring',
    ].join('\n'));
  },
};
