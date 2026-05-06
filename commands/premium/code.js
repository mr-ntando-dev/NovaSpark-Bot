'use strict';
const APIs     = require('../../utils/api');
const database = require('../../database');

module.exports = {
  name: 'code',
  aliases: ['codegen'],
  description: '[PREMIUM] Generate working code in any language',
  category: 'premium',
  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const userId = sender.split('@')[0];
    // All users enjoy Premium for free
    if (args.length < 2) return reply('💻 Usage: *.code <language> <task>*\nExample: .code Python sort a list of numbers');
    database.logCommand(sender, 'code');
    const lang = args[0];
    const task = args.slice(1).join(' ');
    await sock.sendPresenceUpdate('composing', from);
    await reply('💻 *Generating code...*');
    const system = `You are NovaSpark, an expert programmer and coding teacher.
Generate clean, working ${lang} code for the given task.
Include:
- Complete runnable code in a code block
- Brief explanation of how it works (2-3 sentences)
- Key lines commented
- Example output if applicable`;
    try {
      const result = await APIs.chatAI(`Write ${lang} code to: ${task}`, system);
      await reply(`💻 *Code Generator*\n\n*Task:* ${task}\n*Language:* ${lang}\n\n${result}\n\n_Nova AI ⚡_`);
    } catch {
      await reply('❌ Code generation failed. Try again!');
    }
  },
};
