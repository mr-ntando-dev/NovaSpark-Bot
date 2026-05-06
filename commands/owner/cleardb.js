/**
 * ⚡ NovaSpark Bot v5 — Clear Database
 * .cleardb <table>  — wipe a specific database table
 * .cleardb list     — show available tables
 * Owner only — irreversible, prompts for confirmation
 * By Dev-Ntando
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../database');
const DATA_PATH = path.resolve(__dirname, '../../data');

const TABLES = {
  warns:      path.join(DB_PATH, 'warns.json'),
  premium:    path.join(DB_PATH, 'premium.json'),
  reminders:  path.join(DB_PATH, 'reminders.json'),
  analytics:  path.join(DB_PATH, 'analytics.json'),
  memory:     path.join(DB_PATH, 'memory.json'),
  profiles:   path.join(DB_PATH, 'profiles.json'),
  userstats:  path.join(DB_PATH, 'user_stats.json'),
  groupstats: path.join(DB_PATH, 'group_stats.json'),
  banlist:    path.join(DATA_PATH, 'banlist.json'),
};

const EMPTY = {
  warns:      {},
  premium:    { users: [] },
  reminders:  [],
  analytics:  {},
  memory:     {},
  profiles:   {},
  userstats:  {},
  groupstats: {},
  banlist:    {},
};

// Pending confirmations: jid → { table, expires }
const pending = new Map();

module.exports = {
  name: 'cleardb',
  aliases: ['resetdb', 'wipedb'],
  description: '🗑️ Clear a specific database table (irreversible)',
  category: 'owner',
  ownerOnly: true,

  async execute({ from, sender, args, reply }) {
    const sub = (args[0] || '').toLowerCase();

    // ── list available tables ────────────────────────────────────────────
    if (!sub || sub === 'list') {
      const tableInfo = Object.entries(TABLES).map(([name, file]) => {
        let size = '?';
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          size = Array.isArray(data)
            ? `${data.length} entries`
            : `${Object.keys(data).length} keys`;
        } catch { size = 'empty / not found'; }
        return `  • \`${name}\` — ${size}`;
      }).join('\n');

      return reply(
        '🗑️ *Clear Database*\n' +
        '━'.repeat(28) + '\n\n' +
        'Usage: `.cleardb <table>`\n' +
        'Confirm: `.cleardb <table> confirm`\n\n' +
        '📂 *Available tables:*\n' +
        tableInfo + '\n\n' +
        '⚠️ _This is irreversible. You will be asked to confirm._'
      );
    }

    // ── validate table name ──────────────────────────────────────────────
    if (!TABLES[sub]) {
      return reply(
        `❌ Unknown table: \`${sub}\`\n\n` +
        `Valid tables: ${Object.keys(TABLES).join(', ')}\n\n` +
        'Run `.cleardb list` for details.'
      );
    }

    // ── confirm step ─────────────────────────────────────────────────────
    const confirm = (args[1] || '').toLowerCase();
    const key     = `${sender}:${sub}`;
    const now     = Date.now();

    if (confirm !== 'confirm') {
      // Set pending confirmation (30s window)
      pending.set(key, { table: sub, expires: now + 30000 });
      return reply(
        `⚠️ *Are you sure you want to wipe the \`${sub}\` table?*\n\n` +
        'This *cannot be undone*.\n\n' +
        `To confirm, type: \`.cleardb ${sub} confirm\` within 30 seconds.`
      );
    }

    // Check confirmation window
    const pend = pending.get(key);
    if (!pend || Date.now() > pend.expires) {
      pending.delete(key);
      return reply(
        `⏰ Confirmation expired. Run \`.cleardb ${sub}\` again to start over.`
      );
    }

    pending.delete(key);

    // ── wipe the table ────────────────────────────────────────────────────
    try {
      const file    = TABLES[sub];
      const empty   = EMPTY[sub];
      const dir     = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(empty, null, 2));

      await reply(`✅ *\`${sub}\` table has been wiped.*\n\n_Starting fresh. Hope you meant to do that._`);
    } catch (err) {
      await reply(`❌ Failed to clear \`${sub}\`: ${err.message}`);
    }
  },
};
