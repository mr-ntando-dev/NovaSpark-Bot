/**
 * ⚡ NovaSpark Bot v10.0 — 2026 Edition
 * .grouprules / .rules — View group rules set by admins
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

module.exports = [
  {
    name: 'grouprules',
    aliases: ['grules', 'viewrules'],
    description: '📋 View the group rules',
    category: 'group',
    groupOnly: true,

    execute: async ({ from, reply }) => {
      const gs    = database.getGroupSettings(from);
      const rules = gs.groupRules || gs.rules;

      if (!rules || (Array.isArray(rules) && !rules.length)) {
        return reply(
          `📋 *Group Rules*\n${'━'.repeat(28)}\n\n` +
          `No rules have been set for this group yet.\n\n` +
          `_Admins can set rules with_ \`.setrules\`\n\n` +
          `_⚡ NovaSpark Bot — Dev-Ntando_`
        );
      }

      // Handle both string and array rules
      let rulesText;
      if (Array.isArray(rules)) {
        rulesText = rules.map((r, i) => `${i + 1}. ${r}`).join('\n');
      } else {
        rulesText = rules;
      }

      return reply(
        `📋 *Group Rules*\n${'━'.repeat(28)}\n\n` +
        `${rulesText}\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    },
  },
  {
    name: 'addrule',
    aliases: ['newrule'],
    description: '📋 Add a rule to the group rules list',
    category: 'group',
    groupOnly: true,
    adminOnly: true,

    execute: async ({ args, from, reply }) => {
      if (!args.length) return reply('❌ Provide a rule text.\n\nUsage: .addrule No spamming or sharing offensive content');

      const gs   = database.getGroupSettings(from);
      const rules = Array.isArray(gs.groupRules) ? gs.groupRules : [];
      const newRule = args.join(' ');

      rules.push(newRule);
      database.updateGroupSettings(from, { groupRules: rules });

      return reply(
        `✅ *Rule Added!*\n${'━'.repeat(28)}\n\n` +
        `📌 Rule ${rules.length}: ${newRule}\n\n` +
        `_Total rules: ${rules.length} — use .grouprules to view all_\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    },
  },
  {
    name: 'clearrules',
    aliases: ['delrules', 'removerules'],
    description: '📋 Clear all group rules',
    category: 'group',
    groupOnly: true,
    adminOnly: true,

    execute: async ({ from, reply }) => {
      database.updateGroupSettings(from, { groupRules: [] });
      return reply(`🗑️ *Group rules cleared.*\n\n_⚡ NovaSpark Bot — Dev-Ntando_`);
    },
  },
];
