'use strict';
const database = require('../../database');
const autochat = require('../ai/autochat');

module.exports = {
  name: 'setpersona',
  aliases: ['custompersona', 'mypersona'],
  description: '[PREMIUM] Create a fully custom AI persona for AutoChat',
  category: 'premium',
  execute: async ({ from, sender, args, reply }) => {
    const userId = sender.split('@')[0];
    if (!database.isPremium(userId)) return reply('💎 *Custom personas* are a *Premium* feature.\nType *.myplan* for upgrade info.');
    const description = args.join(' ').trim();
    if (!description || description.length < 10) {
      return reply(
        '🎭 Usage: *.setpersona <personality description>*\n\n' +
        'Example:\n_.setpersona You are a sarcastic but helpful assistant who speaks in robot-speak and ends every message with BEEP BOOP_\n\n' +
        '_Describe any personality you want — the AI will adopt it fully!_'
      );
    }
    database.logCommand(sender, 'setpersona');
    const personaKey = `custom_${userId}`;
    autochat.PERSONAS[personaKey] = {
      name: 'Your Custom Persona',
      prompt: description,
    };
    if (autochat.sessions.has(from)) {
      autochat.sessions.get(from).persona = personaKey;
    }
    await reply(
      `🎭 *Custom Persona Activated!*\n\n` +
      `_"${description.slice(0, 100)}${description.length > 100 ? '...' : ''}"_\n\n` +
      `AutoChat will now use your custom persona in this chat.\n` +
      `Type *.autochat status* to confirm.\n` +
      `To switch back: *.autochat persona friendly*`
    );
  },
};
