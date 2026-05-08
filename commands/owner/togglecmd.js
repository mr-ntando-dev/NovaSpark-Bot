/**
 * ⚡ NovaSpark Bot — Toggle Command On/Off
 * .togglecmd <command>  — disable or re-enable any command globally
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

const PROTECTED = ['menu', 'togglecmd', 'restart', 'shutdown', 'eval'];

module.exports = {
  name: 'togglecmd',
  aliases: ['disablecmd', 'enablecmd', 'cmdtoggle'],
  category: 'owner',
  description: 'Enable or disable any command globally',
  usage: '.togglecmd <command>  |  .togglecmd list',
  ownerOnly: true,

  async execute({ args, reply }) {
    const input = (args[0] || '').toLowerCase().trim();

    if (!input || input === 'list') {
      const disabled = database.get ? (database.get('disabledCmds') || []) : [];
      return reply(
        `⚙️ *Toggle Command*\n\n` +
        `Usage: \`.togglecmd <command>\`\n\n` +
        `Currently disabled (${disabled.length}):\n` +
        (disabled.length ? disabled.map(c => `  • ${c}`).join('\n') : '  _None_') +
        `\n\n_Protected commands cannot be disabled: ${PROTECTED.join(', ')}_`
      );
    }

    if (PROTECTED.includes(input)) {
      return reply(`🔒 *${input}* is a protected command and cannot be disabled.`);
    }

    const disabled = database.get ? (database.get('disabledCmds') || []) : [];
    const idx      = disabled.indexOf(input);

    if (idx === -1) {
      disabled.push(input);
      if (database.set) database.set('disabledCmds', disabled);
      return reply(`❌ Command \`${input}\` has been *disabled* globally.\nUse \`.togglecmd ${input}\` to re-enable it.`);
    } else {
      disabled.splice(idx, 1);
      if (database.set) database.set('disabledCmds', disabled);
      return reply(`✅ Command \`${input}\` has been *re-enabled* globally.`);
    }
  },
};
