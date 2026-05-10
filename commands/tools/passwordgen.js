/**
 * ⚡ NovaSpark Bot — Password Generator (FREE, no API)
 * .passgen [length] [options]
 * Options: --no-symbols --no-numbers --no-upper --no-lower --pin
 */
'use strict';

const LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

function generate(length, charset) {
  let password = '';
  const arr = charset.split('');
  for (let i = 0; i < length; i++) {
    password += arr[Math.floor(Math.random() * arr.length)];
  }
  return password;
}

function passwordStrength(pass) {
  let score = 0;
  if (pass.length >= 8)  score++;
  if (pass.length >= 12) score++;
  if (pass.length >= 16) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;

  if (score <= 2) return { label: 'Weak 🔴', bar: '🟥⬜⬜⬜⬜' };
  if (score <= 3) return { label: 'Fair 🟠', bar: '🟥🟧⬜⬜⬜' };
  if (score <= 4) return { label: 'Good 🟡', bar: '🟥🟧🟨⬜⬜' };
  if (score <= 5) return { label: 'Strong 🟢', bar: '🟥🟧🟨🟩⬜' };
  return { label: 'Very Strong 💪', bar: '🟥🟧🟨🟩🟦' };
}

module.exports = {
  name:    'passgen',
  aliases: ['passwordgen', 'genpass', 'pwgen', 'pw'],
  category: 'tools',
  desc:    'Generate a secure random password',
  usage:   '.passgen [length] [--no-symbols] [--no-numbers] [--no-upper] [--no-lower] [--pin]',
  example: '.passgen 16\n.passgen 12 --no-symbols\n.passgen --pin\n.passgen 20',
  async execute({ sock, msg, args, from }) {
    const flags = args.join(' ').toLowerCase();
    const isPin = flags.includes('--pin');

    if (isPin) {
      const len = 6;
      const pin = generate(len, NUMBERS);
      return sock.sendMessage(from, {
        text: `🔐 *PIN Generated*\n\n\`\`\`${pin}\`\`\`\n\n_⚠️ Store it safely — delete this message after saving._\n_Powered by NovaSpark Bot v11_`,
      }, { quoted: msg });
    }

    const lengthArg = args.find(a => /^\d+$/.test(a));
    const length    = Math.min(Math.max(parseInt(lengthArg || '16'), 4), 64);

    let charset = '';
    if (!flags.includes('--no-lower'))   charset += LOWER;
    if (!flags.includes('--no-upper'))   charset += UPPER;
    if (!flags.includes('--no-numbers')) charset += NUMBERS;
    if (!flags.includes('--no-symbols')) charset += SYMBOLS;

    if (!charset) {
      return sock.sendMessage(from, {
        text: '❌ You disabled all character types! At least one type must be enabled.',
      }, { quoted: msg });
    }

    // Generate 3 passwords for choice
    const pass1    = generate(length, charset);
    const pass2    = generate(length, charset);
    const pass3    = generate(length, charset);
    const strength = passwordStrength(pass1);

    await sock.sendMessage(from, {
      text: `🔐 *Password Generator*\n\n` +
            `*Option 1:* \`${pass1}\`\n` +
            `*Option 2:* \`${pass2}\`\n` +
            `*Option 3:* \`${pass3}\`\n\n` +
            `📊 *Strength:* ${strength.label}\n${strength.bar}\n` +
            `📏 *Length:* ${length} characters\n\n` +
            `_⚠️ Save it somewhere safe and delete this message!_\n` +
            `_Powered by NovaSpark Bot v11_`,
    }, { quoted: msg });
  },
};
