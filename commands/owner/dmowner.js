/**
 * ⚡ NovaSpark Bot v5 — DM Owner / User
 * .dm @user <message>  — owner can DM any user directly through the bot
 * .reply @user <msg>   — alias
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'dm',
  aliases: ['dmuser', 'sendmsg', 'msg'],
  description: '💬 Send a direct message to any user via the bot',
  category: 'owner',
  ownerOnly: true,

  async execute({ sock, from, msg, args, reply, mentions }) {
    const target = mentions?.[0];
    const text   = args.filter(a => !a.startsWith('@')).join(' ').trim();

    if (!target || !text) {
      return reply(
        '💬 *DM User*\n' +
        '━'.repeat(24) + '\n\n' +
        'Usage: `.dm @user <message>`\n\n' +
        'Example: `.dm @user Hey, the owner wants a word. 👀`'
      );
    }

    const targetJid = target.includes('@') ? target : target + '@s.whatsapp.net';
    const num       = targetJid.split('@')[0];

    try {
      await sock.sendMessage(targetJid, {
        text:
          `📬 *Message from the bot owner:*\n\n` +
          `_${text}_\n\n` +
          `⚡ _NovaSpark Bot_`,
      });

      await reply(`✅ Message sent to +${num}.`);
    } catch (err) {
      await reply(`❌ Failed to DM +${num}: ${err.message}`);
    }
  },
};
