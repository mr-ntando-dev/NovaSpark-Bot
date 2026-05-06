/**
 * ⚡ NovaSpark Bot v8.0 — Auto Forward Command
 * .autoforward on/off <destination JID>
 * .autoforward set <source> <destination>
 * Forwards every message from source to destination automatically
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'autoforward',
  aliases: ['autofwd', 'fwdall'],
  description: 'Auto-forward messages from one chat to another',
  category: 'owner',
  ownerOnly: true,

  execute: async ({ sock, msg, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'set') {
      // .autoforward set <sourceJID> <destJID>
      const source = args[1];
      const dest   = args[2];
      if (!source || !dest) {
        return reply(
          '📨 *Auto Forward — Set*\n\n' +
          'Usage: `.autoforward set <sourceJID> <destJID>`\n\n' +
          'JID format: `263771234567@s.whatsapp.net` (DM) or `GROUPID@g.us` (group)\n\n' +
          'Tip: Use `.listgroups` to get group JIDs.'
        );
      }
      if (database.setForwardRule) database.setForwardRule(source, dest);
      return reply(`✅ *Auto Forward Set!*\n\nFrom: \`${source}\`\nTo: \`${dest}\`\n\n_Every message from source will be forwarded to destination._`);
    }

    if (sub === 'list') {
      const rules = database.getForwardRules ? database.getForwardRules() : [];
      if (!rules.length) return reply('📭 No forward rules set.');
      const lines = rules.map((r, i) => `${i+1}. From: \`${r.source}\`\n   To: \`${r.dest}\``).join('\n\n');
      return reply(`📨 *Forward Rules*\n\n${lines}`);
    }

    if (sub === 'remove') {
      const idx = parseInt(args[1]) - 1;
      if (database.removeForwardRule) database.removeForwardRule(idx);
      return reply('🗑️ Forward rule removed.');
    }

    if (sub === 'on') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoForward', true);
      return reply('📨 *Auto Forward: ON* — Rules are now active.');
    }

    if (sub === 'off') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoForward', false);
      return reply('📨 *Auto Forward: OFF* — Rules paused.');
    }

    return reply(
      '📨 *Auto Forward*\n\n' +
      '`.autoforward set <src> <dst>` — Set a forward rule\n' +
      '`.autoforward list` — List all rules\n' +
      '`.autoforward remove <#>` — Remove a rule\n' +
      '`.autoforward on/off` — Enable/disable all rules'
    );
  },
};
