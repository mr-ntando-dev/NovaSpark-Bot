/**
 * ⚡ NovaSpark Bot — Base64 Encode / Decode
 * .base64 encode <text>  |  .base64 decode <text>
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'base64',
  aliases: ['b64'],
  category: 'tools',
  description: 'Encode or decode Base64 text',
  usage: '.base64 encode <text>  |  .base64 decode <text>',

  async execute({ args, reply }) {
    const mode = (args[0] || '').toLowerCase();
    const text = args.slice(1).join(' ').trim();

    if (!mode || !text) {
      return reply(
        '⚙️ *Base64 Tool*\n\n' +
        'Usage:\n' +
        '  `.base64 encode Hello World`\n' +
        '  `.base64 decode SGVsbG8gV29ybGQ=`'
      );
    }

    if (mode === 'encode') {
      const encoded = Buffer.from(text, 'utf8').toString('base64');
      return reply(`🔒 *Base64 Encoded*\n\n\`\`\`${encoded}\`\`\``);
    }

    if (mode === 'decode') {
      try {
        const decoded = Buffer.from(text, 'base64').toString('utf8');
        return reply(`🔓 *Base64 Decoded*\n\n${decoded}`);
      } catch {
        return reply('❌ Invalid Base64 string. Make sure it is properly formatted.');
      }
    }

    return reply('❌ Unknown mode. Use `encode` or `decode`.');
  },
};
