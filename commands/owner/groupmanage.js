/**
 * ⚡ NovaSpark Bot v5 — Owner Group Management
 * .listgroups        — list every group the bot is in
 * .leavegroup [id]   — make bot leave a specific group (or current group)
 * .joingroup <link>  — join a group via invite link
 * .groupbroadcast    — send a message to ALL groups (alias for .broadcast)
 * By Dev-Ntando
 */
'use strict';

module.exports = [
  // ── .listgroups ───────────────────────────────────────────────────────────
  {
    name: 'listgroups',
    aliases: ['mygroups', 'botgroups', 'groups'],
    description: '📋 List all groups the bot is currently in',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, reply }) {
      try {
        const chats = await sock.groupFetchAllParticipating();
        const keys  = Object.keys(chats);

        if (!keys.length) return reply('📭 Bot is not in any groups.');

        const lines = keys.map((id, i) => {
          const g    = chats[id];
          const name = g.subject || 'Unnamed Group';
          const cnt  = (g.participants || []).length;
          return `  ${i + 1}. *${name}*\n     👥 ${cnt} members\n     🆔 \`${id}\``;
        });

        // Split into chunks of 20 to avoid message length limits
        const chunks = [];
        for (let i = 0; i < lines.length; i += 20) {
          chunks.push(lines.slice(i, i + 20));
        }

        for (let c = 0; c < chunks.length; c++) {
          const header = c === 0
            ? `📋 *Groups (${keys.length} total)*\n${'━'.repeat(30)}\n\n`
            : `📋 *Groups (continued ${c + 1}/${chunks.length})*\n\n`;
          await reply(header + chunks[c].join('\n\n'));
        }
      } catch (err) {
        await reply(`❌ Failed to fetch groups: ${err.message}`);
      }
    },
  },

  // ── .leavegroup ───────────────────────────────────────────────────────────
  {
    name: 'leavegroup',
    aliases: ['leave', 'exitgroup'],
    description: '🚪 Make the bot leave a group',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, from, args, reply }) {
      const targetId = args[0] || from;

      // Validate it looks like a group JID
      if (!targetId.endsWith('@g.us')) {
        return reply(
          '🚪 *Leave Group*\n' +
          '━'.repeat(24) + '\n\n' +
          'Usage:\n' +
          '  `.leavegroup` — leave the current group\n' +
          '  `.leavegroup <group-id>` — leave a specific group\n\n' +
          '_Get group IDs from `.listgroups`_'
        );
      }

      try {
        await reply(`🚪 Leaving group \`${targetId}\`...`);
        await sock.groupLeave(targetId);
      } catch (err) {
        await reply(`❌ Failed to leave: ${err.message}`);
      }
    },
  },

  // ── .joingroup ────────────────────────────────────────────────────────────
  {
    name: 'joingroup',
    aliases: ['join', 'joinchat'],
    description: '🔗 Join a group via invite link',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, args, reply }) {
      const link = args[0];
      if (!link) return reply('Usage: `.joingroup <invite-link>`\nExample: `.joingroup https://chat.whatsapp.com/AbCxYz123`');

      // Extract invite code from link
      const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
      if (!match) return reply('❌ Invalid WhatsApp group invite link. It should look like:\n`https://chat.whatsapp.com/AbCxYz123`');

      const code = match[1];
      try {
        await reply(`🔗 Joining group with code \`${code}\`...`);
        await sock.groupAcceptInvite(code);
        await reply('✅ Successfully joined the group!');
      } catch (err) {
        await reply(`❌ Failed to join: ${err.message}`);
      }
    },
  },
];
