/**
 * ⚡ NovaSpark Bot — Palindrome Checker
 * .palindrome <text>  — checks if text is a palindrome
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'palindrome',
  aliases: ['ispalindrome', 'palcheck'],
  category: 'tools',
  description: 'Check if a word or phrase is a palindrome',
  usage: '.palindrome <text>',

  async execute({ args, reply }) {
    const text = args.join(' ').trim();
    if (!text) return reply('🔄 Usage: `.palindrome <word or phrase>`\n\nExample: `.palindrome racecar`');

    const clean    = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = clean.split('').reverse().join('');
    const isPalin  = clean === reversed;

    return reply(
      `🔄 *Palindrome Check*\n\n` +
      `Input: *"${text}"*\n` +
      `Cleaned: \`${clean}\`\n` +
      `Reversed: \`${reversed}\`\n\n` +
      (isPalin
        ? `✅ *Yes! It's a palindrome!* 🎉`
        : `❌ *Not a palindrome.*`)
    );
  },
};
