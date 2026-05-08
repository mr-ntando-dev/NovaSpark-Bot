/**
 * ⚡ NovaSpark Bot — Clear Chat / Bulk Message Deleter
 * .clearchat <n>  — delete the last n bot messages in current chat
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'clearchat',
  aliases: ['clearchat', 'deletelast', 'purge'],
  category: 'owner',
  description: "Delete the bot's last N messages in the current chat",
  usage: '.clearchat <number>',
  ownerOnly: true,

  async execute({ sock, msg, from, args, reply }) {
    const n = parseInt(args[0] || '5', 10);
    if (isNaN(n) || n < 1 || n > 50) {
      return reply('🧹 Usage: `.clearchat <1-50>`\n\nExample: `.clearchat 10` — deletes my last 10 messages.');
    }

    try {
      // Load store messages if available
      const store = sock.store || sock?.ev?.store;
      if (!store) {
        return reply(
          '⚠️ Message store not available.\n\n' +
          'For bulk deletion, reply to a message and use `.delete` to delete it individually.\n' +
          'Or use `.bulkdelete` if available.'
        );
      }

      const msgs = store.messages[from]?.array || [];
      const botJid = sock.user?.id;
      const botMsgs = msgs
        .filter(m => m.key.fromMe || m.key.participant === botJid)
        .slice(-n);

      if (!botMsgs.length) return reply('❌ No recent bot messages found to delete.');

      let deleted = 0;
      for (const m of botMsgs) {
        try {
          await sock.sendMessage(from, { delete: m.key });
          deleted++;
          await new Promise(r => setTimeout(r, 300));
        } catch {}
      }

      return reply(`🧹 Deleted *${deleted}* message(s).`);
    } catch (err) {
      return reply(`❌ Error: ${err.message}`);
    }
  },
};
