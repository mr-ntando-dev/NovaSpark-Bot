'use strict';
const APIs    = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'translate',
  aliases: ['trans', 'tr'],
  description: 'Translate text to any language',
  category: 'free',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    database.logCommand(sender, 'translate');
    if (args.length < 2) return reply('🌍 Usage: *.translate <language> <text>*\nExample: .translate French Hello how are you?');
    const lang = args[0];
    const text = args.slice(1).join(' ').trim();
    await sock.sendPresenceUpdate('composing', from);
    const system = `You are NovaSpark, an expert translator. Translate the given text to ${lang}. Provide only the translation, nothing else.`;
    try {
      const result = await APIs.chatAI(`Translate to ${lang}: "${text}"`, system);
      await reply(`🌍 *Translation to ${lang}:*\n\n${result}\n\n_Original: ${text}_\n\n_Nova AI ⚡_`);
    } catch {
      await reply('❌ Translation failed. Try again!');
    }
  },
};
