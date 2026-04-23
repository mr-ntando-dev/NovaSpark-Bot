/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .setnick <name> — Set the bot's WhatsApp display name (Owner only)
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = {
  name: 'setnick',
  aliases: ['botnick', 'setname'],
  description: '✏️ Change the bot\'s WhatsApp display name',
  category: 'owner',
  ownerOnly: true,

  execute: async ({ sock, args, reply, sender }) => {
    const ownerNums = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
    const senderNum = sender.split('@')[0].split(':')[0];
    if (!ownerNums.map(String).includes(senderNum)) return reply('🚫 Owner only command.');

    const name = args.join(' ').trim();
    if (!name) return reply('Usage: `.setnick <new name>`\nExample: `.setnick NovaSpark 🔥`');

    try {
      await sock.updateProfileName(name);
      return reply(`✅ *Bot name changed to:* "${name}"\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    } catch (e) {
      return reply(`❌ Failed to change name: ${e.message}`);
    }
  },
};
