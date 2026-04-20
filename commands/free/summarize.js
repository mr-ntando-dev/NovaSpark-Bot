'use strict';
const APIs    = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'summarize',
  aliases: ['summary', 'sum', 'tldr'],
  description: 'Summarize any text — reply to a message or paste text directly',
  category: 'free',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    database.logCommand(sender, 'summarize');
    // Check for quoted message
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
    const directText = args.join(' ').trim();
    const text = quotedText || directText;

    if (!text || text.length < 10) {
      return reply('📋 Usage: *.summarize <text>*\nOR reply to a message with *.summarize*');
    }
    await sock.sendPresenceUpdate('composing', from);
    const system = 'You are NovaSpark, an expert summarizer. Summarize the following text into clear, concise bullet points. Use WhatsApp bold (*) for key points. Keep it brief but complete.';
    try {
      const summary = await APIs.chatAI(`Summarize this:\n\n${text}`, system);
      await reply(`📋 *Summary*\n\n${summary}\n\n_Nova AI ⚡_`);
    } catch {
      await reply('❌ Couldn\'t summarize right now. Try again!');
    }
  },
};
