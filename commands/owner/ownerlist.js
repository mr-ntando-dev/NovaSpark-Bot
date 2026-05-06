/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .ownerlist — Show all bot owners
 * .addowner <number> — Add a new owner (existing owners only)
 * .removeowner <number> — Remove an owner (existing owners only)
 * By Dev-Ntando
 */
'use strict';
const fs     = require('fs');
const path   = require('path');
const config = require('../../config');

const EXTRA_OWNERS_FILE = path.resolve(__dirname, '../../data/extra_owners.json');

function readExtra() {
  try {
    if (!fs.existsSync(EXTRA_OWNERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(EXTRA_OWNERS_FILE, 'utf8'));
  } catch { return []; }
}

function writeExtra(arr) {
  const dir = path.dirname(EXTRA_OWNERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(EXTRA_OWNERS_FILE, JSON.stringify(arr, null, 2));
}

function getAllOwners() {
  const base  = Array.isArray(config.ownerNumber) ? config.ownerNumber.map(String) : [String(config.ownerNumber)];
  const extra = readExtra().map(String);
  return [...new Set([...base, ...extra])];
}

module.exports = [
  {
    name: 'ownerlist',
    aliases: ['owners', 'botowners'],
    description: '👑 List all bot owners',
    category: 'owner',
    ownerOnly: true,

    execute: async ({ reply, sender }) => {
      const allOwners = getAllOwners();
      const senderNum = sender.split('@')[0].split(':')[0];
      if (!allOwners.includes(senderNum)) return reply('🚫 Owner only command.');

      const names = Array.isArray(config.ownerName) ? config.ownerName : [config.ownerName];
      let list    = `👑 *Bot Owners*\n${'━'.repeat(28)}\n\n`;
      allOwners.forEach((num, i) => {
        const name = names[i] || 'Owner';
        list += `  ${i + 1}. *${name}* — +${num}\n`;
      });
      list += `\nTotal: ${allOwners.length} owner(s)\n_⚡ NovaSpark Bot_`;
      return reply(list);
    },
  },

  {
    name: 'addowner',
    aliases: ['newowner'],
    description: '➕ Add a new bot owner',
    category: 'owner',
    ownerOnly: true,

    execute: async ({ args, reply, sender }) => {
      const allOwners = getAllOwners();
      const senderNum = sender.split('@')[0].split(':')[0];
      if (!allOwners.includes(senderNum)) return reply('🚫 Owner only command.');

      const num = args[0]?.replace(/[^0-9]/g, '');
      if (!num || num.length < 9) return reply('Usage: `.addowner <number>`\nExample: `.addowner 263777000000`');
      if (allOwners.includes(num)) return reply(`⚠️ +${num} is already an owner.`);

      const extra = readExtra();
      extra.push(num);
      writeExtra(extra);
      return reply(`✅ *+${num} added as bot owner!*\n_They can now use all owner commands._\n_⚡ NovaSpark Bot_`);
    },
  },

  {
    name: 'removeowner',
    aliases: ['delowner'],
    description: '➖ Remove a bot owner',
    category: 'owner',
    ownerOnly: true,

    execute: async ({ args, reply, sender }) => {
      const base      = Array.isArray(config.ownerNumber) ? config.ownerNumber.map(String) : [String(config.ownerNumber)];
      const allOwners = getAllOwners();
      const senderNum = sender.split('@')[0].split(':')[0];
      if (!allOwners.includes(senderNum)) return reply('🚫 Owner only command.');

      const num = args[0]?.replace(/[^0-9]/g, '');
      if (!num) return reply('Usage: `.removeowner <number>`');
      if (base.includes(num)) return reply('❌ Cannot remove a primary owner set in config.js.');

      const extra    = readExtra();
      const filtered = extra.filter(n => n !== num);
      if (filtered.length === extra.length) return reply(`⚠️ +${num} is not in the extra owners list.`);

      writeExtra(filtered);
      return reply(`✅ *+${num} removed from bot owners.*\n_⚡ NovaSpark Bot_`);
    },
  },
];
