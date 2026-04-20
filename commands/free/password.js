/**
 * ⚡ NovaSpark Bot v5 — Password Generator
 * Generates a strong random password
 * By Dev-Ntando
 */
'use strict';

const LOWER  = 'abcdefghijklmnopqrstuvwxyz';
const UPPER  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

function generate(length, useUpper, useDigits, useSymbols) {
  let pool = LOWER;
  if (useUpper)   pool += UPPER;
  if (useDigits)  pool += DIGITS;
  if (useSymbols) pool += SYMBOLS;

  // Guarantee at least one char from each required set
  let pwd = '';
  pwd += LOWER[Math.floor(Math.random() * LOWER.length)];
  if (useUpper)   pwd += UPPER[Math.floor(Math.random() * UPPER.length)];
  if (useDigits)  pwd += DIGITS[Math.floor(Math.random() * DIGITS.length)];
  if (useSymbols) pwd += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  while (pwd.length < length) {
    pwd += pool[Math.floor(Math.random() * pool.length)];
  }

  // Shuffle
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

function strength(len, hasUpper, hasDigits, hasSymbols) {
  const score = len + (hasUpper ? 10 : 0) + (hasDigits ? 10 : 0) + (hasSymbols ? 15 : 0);
  if (score >= 35) return '💪 Very Strong';
  if (score >= 25) return '✅ Strong';
  if (score >= 18) return '⚠️ Moderate';
  return '❌ Weak';
}

module.exports = {
  name: 'password',
  aliases: ['passwd', 'genpass', 'passgen'],
  category: 'free',
  description: 'Generate a strong random password. Usage: .password [length] [options]',
  usage: '.password | .password 20 | .password 16 nosymbols',

  async execute({ args, reply }) {
    const len = Math.min(Math.max(parseInt(args[0]) || 16, 6), 64);
    const noSymbols = args.includes('nosymbols') || args.includes('simple');
    const noUpper   = args.includes('nouppercase') || args.includes('lower');

    const useUpper   = !noUpper;
    const useDigits  = true;
    const useSymbols = !noSymbols;

    const pwd = generate(len, useUpper, useDigits, useSymbols);
    const str = strength(len, useUpper, useDigits, useSymbols);

    const lines = [
      '🔐 *Password Generator*',
      '━'.repeat(28),
      '',
      `\`${pwd}\``,
      '',
      `📏 Length: *${len}*`,
      `💡 Strength: ${str}`,
      '',
      '_⚠️ Save this somewhere safe — I won\'t remember it either._',
    ];
    await reply(lines.join('\n'));
  },
};
