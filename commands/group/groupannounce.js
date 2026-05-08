/**
 * ⚡ NovaSpark Bot — Group Announcement
 * .announce <message>  — sends a pinned-style announcement to the group
 * By Dev-Ntando
 */
'use strict';

const config = require('../../config');

module.exports = {
  name: 'announce',
  aliases: ['announcement', 'ga', 'groupannounce'],
  category: 'group',
  description: 'Send a styled announcement to the group with @everyone tag',
  usage: '.announce <message>',
  adminOnly: true,
  groupOnly: true,

  async execute({ sock, msg, from, args, reply, mentions, groupMeta, isBotAdmin }) {
    const text = args.join(' ').trim();
    if (!text) {
      return reply(
        '📢 *Announcement Command*\n\n' +
        'Usage: `.announce <your message>`\n\n' +
        'Example: `.announce Meeting at 8pm tonight! Don\'t be late.`'
      );
    }

    if (!isBotAdmin) {
      return reply('⚠️ I need to be an admin to tag everyone in the announcement.');
    }

    const allMembers = (groupMeta?.participants || []).map(p => p.id);
    const groupName  = groupMeta?.subject || 'Group';
    const now        = new Date().toLocaleString('en-ZA', {
      timeZone: config.timezone || 'Africa/Harare',
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });

    const announcement =
      `📢 *ANNOUNCEMENT*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *${groupName}*\n` +
      `🕐 ${now}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${text}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `_⚡ Powered by ${config.botName}_`;

    await sock.sendMessage(from, {
      text: announcement,
      mentions: allMembers,
    });
  },
};
