/**
 * ⚡ NovaSpark Bot v5 — Set Prefix
 * .setprefix <char>  — change command prefix at runtime (persists via data file)
 * .resetprefix       — restore default prefix from config
 * By Dev-Ntando
 */
'use strict';
const fs     = require('fs');
const path   = require('path');
const config = require('../../config');

const PREFIX_FILE = path.resolve(__dirname, '../../data/prefix.json');

function readPrefix() {
  try {
    if (!fs.existsSync(PREFIX_FILE)) return config.prefix;
    return JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8')).prefix || config.prefix;
  } catch { return config.prefix; }
}

function savePrefix(p) {
  const dir = path.dirname(PREFIX_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PREFIX_FILE, JSON.stringify({ prefix: p }, null, 2));
}

// Export so index.js / handler.js can call getActivePrefix() on startup
const getActivePrefix = () => readPrefix();

module.exports = [
  { _prefixExport: true, getActivePrefix },

  // ── .setprefix ────────────────────────────────────────────────────────────
  {
    name: 'setprefix',
    aliases: ['changeprefix', 'prefix'],
    description: '⚙️ Change the bot command prefix at runtime',
    category: 'owner',
    ownerOnly: true,

    async execute({ args, reply }) {
      const newPrefix = (args[0] || '').trim();
      if (!newPrefix || newPrefix.length > 3) {
        return reply(
          '⚙️ *Set Prefix*\n' +
          '━'.repeat(24) + '\n\n' +
          `Current prefix: \`${readPrefix()}\`\n\n` +
          'Usage: `.setprefix <char>`\n' +
          'Examples: `.setprefix !`  `.setprefix /`  `.setprefix #`\n\n' +
          '_Max 3 characters._'
        );
      }

      const forbidden = ['\\', '`', '"', "'"];
      if (forbidden.includes(newPrefix)) {
        return reply(`❌ Character \`${newPrefix}\` is not allowed as a prefix.`);
      }

      savePrefix(newPrefix);
      // Mutate in-memory so it takes effect immediately without restart
      config.prefix = newPrefix;

      await reply(
        `✅ *Prefix updated to* \`${newPrefix}\`\n\n` +
        `Commands now use: \`${newPrefix}menu\`, \`${newPrefix}help\`, etc.\n\n` +
        '_Changes take effect immediately._'
      );
    },
  },

  // ── .resetprefix ─────────────────────────────────────────────────────────
  {
    name: 'resetprefix',
    aliases: ['defaultprefix'],
    description: '🔄 Restore the default command prefix',
    category: 'owner',
    ownerOnly: true,

    async execute({ reply }) {
      const defaultP = '.';
      savePrefix(defaultP);
      config.prefix  = defaultP;
      await reply(`🔄 Prefix reset to default: \`${defaultP}\``);
    },
  },
];

module.exports.getActivePrefix = getActivePrefix;
