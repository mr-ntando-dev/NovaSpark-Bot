/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .setrules <rules> — Set group rules | .rules — View group rules
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = [
  {
    name: 'setrules',
    aliases: ['rules', 'grouprules'],
    description: '📜 Set or view group rules',
    category: 'group',
    adminOnly: false,

    execute: async ({ sock, from, args, reply, isGroup, isAdmin, groupSettings }) => {
      if (!isGroup) return reply('❌ Group only command.');

      // View rules if no args or just "rules"
      if (!args.length) {
        const gs = database.getGroupSettings(from);
        const rules = gs.rules;
        if (!rules) return reply('📜 No rules set for this group yet.\n\n_Admins: use `.setrules <rules>` to set rules._');
        return reply(`📜 *Group Rules*\n${'━'.repeat(28)}\n\n${rules}\n\n_⚡ NovaSpark Bot_`);
      }

      if (!isAdmin) return reply('🛡️ Only admins can set rules.');

      const rules = args.join(' ');
      const gs    = database.getGroupSettings(from);
      gs.rules = rules;
      if (database.setGroupSettings) database.setGroupSettings(from, gs);
      else if (database.saveGroupSettings) database.saveGroupSettings(from, gs);

      return reply(`✅ *Group rules updated!*\n\n📜 ${rules}\n\n_⚡ NovaSpark Bot_`);
    },
  },
];
