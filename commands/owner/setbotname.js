/**
 * ⚡ NovaSpark Bot — Set Bot Display Name
 * .setbotname <name>  — change bot's WhatsApp display name
 * By Dev-Ntando
 */
'use strict';

const config = require('../../config');

module.exports = {
  name: 'setbotname',
  aliases: ['botname', 'changebotname'],
  category: 'owner',
  description: "Change the bot's WhatsApp display name",
  usage: '.setbotname <new name>',
  ownerOnly: true,

  async execute({ sock, args, reply }) {
    const name = args.join(' ').trim();
    if (!name) {
      return reply(
        `👤 *Set Bot Name*\n\n` +
        `Current name: *${config.botName}*\n\n` +
        `Usage: \`.setbotname <new name>\`\n` +
        `Example: \`.setbotname Nova Pro\``
      );
    }

    if (name.length > 25) {
      return reply('❌ Name too long. Maximum 25 characters.');
    }

    try {
      await sock.updateProfileName(name);
      config.botName = name; // update in memory
      return reply(`✅ Bot name changed to *${name}*!\n\n_Note: WhatsApp may take a moment to reflect the change._`);
    } catch (err) {
      return reply(`❌ Failed to update name: ${err.message}\n\nMake sure the bot is not linked as a secondary device.`);
    }
  },
};
