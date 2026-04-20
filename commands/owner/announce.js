/**
 * ⚡ NovaSpark Bot v5 — Announce
 * .announce <message> — send a formatted announcement to the current chat
 * .globalannounce <message> — send to ALL groups (owner only, use sparingly)
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = [
  // ── .announce ─────────────────────────────────────────────────────────────
  {
    name: 'announce',
    aliases: ['announcement', 'notice'],
    description: '📢 Send a formatted announcement to the current chat',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, from, msg, args, reply }) {
      const text = args.join(' ').trim();
      if (!text) return reply('Usage: `.announce <your message>`');

      const now = new Date().toLocaleString('en-ZA', {
        timeZone: config.timezone,
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      });

      await sock.sendMessage(from, {
        text:
          `📢 *ANNOUNCEMENT*\n` +
          `${'━'.repeat(32)}\n\n` +
          `${text}\n\n` +
          `${'─'.repeat(32)}\n` +
          `🕐 ${now}\n` +
          `⚡ _${config.botName}_`,
      });
    },
  },

  // ── .globalannounce ───────────────────────────────────────────────────────
  {
    name: 'globalannounce',
    aliases: ['gannounce', 'broadcastannounce'],
    description: '🌐 Send a formatted announcement to ALL groups',
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, from, args, reply }) {
      const text = args.join(' ').trim();
      if (!text) return reply('Usage: `.globalannounce <message>`\n\n⚠️ This sends to ALL groups. Use sparingly.');

      const now = new Date().toLocaleString('en-ZA', {
        timeZone: config.timezone,
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      });

      let groups;
      try {
        groups = await sock.groupFetchAllParticipating();
      } catch (err) {
        return reply(`❌ Failed to fetch groups: ${err.message}`);
      }

      const ids = Object.keys(groups);
      if (!ids.length) return reply('❌ Bot is not in any groups.');

      await reply(`📡 Sending global announcement to *${ids.length} groups*...`);

      let sent = 0, failed = 0;
      for (const gid of ids) {
        try {
          await sock.sendMessage(gid, {
            text:
              `📢 *GLOBAL ANNOUNCEMENT*\n` +
              `${'━'.repeat(32)}\n\n` +
              `${text}\n\n` +
              `${'─'.repeat(32)}\n` +
              `🕐 ${now}\n` +
              `⚡ _${config.botName}_`,
          });
          sent++;
          // Throttle to avoid WhatsApp rate limits
          await new Promise(r => setTimeout(r, 800));
        } catch { failed++; }
      }

      await reply(
        `✅ *Global announcement complete.*\n\n` +
        `📤 Sent: *${sent}*\n` +
        `❌ Failed: *${failed}*`
      );
    },
  },
];
