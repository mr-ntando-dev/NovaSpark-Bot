/**
 * ⚡ NovaSpark Bot v5 — Broadcast
 * Send a message to ALL groups the bot is in
 * Original NovaSpark command | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'broadcast',
  aliases: ['bc', 'bcannounce'],
  category: 'owner',
  description: 'Broadcast a message to all groups',
  usage: '.broadcast <message>',
  ownerOnly: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const text = args.join(' ');
    if (!text) return reply('❌ Provide a message to broadcast!\n\n_Example: .broadcast Hello everyone!_');

    try {
      const groups = await sock.groupFetchAllParticipating();
      const jids   = Object.keys(groups);

      if (!jids.length) return reply('❌ Bot is not in any groups.');

      let sent = 0;
      let fail = 0;

      await reply(`📡 Broadcasting to *${jids.length}* groups...`);

      for (const jid of jids) {
        try {
          await sock.sendMessage(jid, {
            text: `📢 *NovaSpark Broadcast*\n\n${text}`,
          });
          sent++;
          await new Promise(r => setTimeout(r, 500)); // avoid flood
        } catch { fail++; }
      }

      await reply(`✅ Broadcast complete!\n\nSent: ${sent}\nFailed: ${fail}`);
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },
};
