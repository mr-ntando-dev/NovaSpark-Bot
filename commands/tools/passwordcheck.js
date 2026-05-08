/**
 * ⚡ NovaSpark Bot — Password Strength Checker
 * .pwcheck <password>  — rates password strength and gives tips
 * By Dev-Ntando
 */
'use strict';

module.exports = {
  name: 'pwcheck',
  aliases: ['passwordcheck', 'checkpassword', 'passcheck'],
  category: 'tools',
  description: 'Check the strength of a password',
  usage: '.pwcheck <password>',

  async execute({ args, reply }) {
    const pw = args.join(' ').trim();
    if (!pw) return reply('🔐 Usage: `.pwcheck <yourpassword>`\n\n⚠️ _Don\'t use your real password — this is for testing only._');

    const checks = {
      length8:    pw.length >= 8,
      length12:   pw.length >= 12,
      length16:   pw.length >= 16,
      hasLower:   /[a-z]/.test(pw),
      hasUpper:   /[A-Z]/.test(pw),
      hasDigit:   /[0-9]/.test(pw),
      hasSpecial: /[^a-zA-Z0-9]/.test(pw),
      noRepeats:  !/(.)\1{2,}/.test(pw),
      noSequence: !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(pw),
    };

    let score = 0;
    if (checks.length8)    score += 1;
    if (checks.length12)   score += 1;
    if (checks.length16)   score += 1;
    if (checks.hasLower)   score += 1;
    if (checks.hasUpper)   score += 1;
    if (checks.hasDigit)   score += 1;
    if (checks.hasSpecial) score += 2;
    if (checks.noRepeats)  score += 1;
    if (checks.noSequence) score += 1;

    const maxScore = 10;
    const pct      = Math.round(score / maxScore * 100);
    const bar      = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));

    let strength, emoji;
    if (pct < 30)      { strength = 'Very Weak';  emoji = '🔴'; }
    else if (pct < 50) { strength = 'Weak';        emoji = '🟠'; }
    else if (pct < 70) { strength = 'Moderate';    emoji = '🟡'; }
    else if (pct < 90) { strength = 'Strong';      emoji = '🟢'; }
    else               { strength = 'Very Strong'; emoji = '💪'; }

    const tips = [];
    if (!checks.length8)    tips.push('• Use at least 8 characters');
    if (!checks.length12)   tips.push('• 12+ characters is even better');
    if (!checks.hasUpper)   tips.push('• Add uppercase letters (A–Z)');
    if (!checks.hasLower)   tips.push('• Add lowercase letters (a–z)');
    if (!checks.hasDigit)   tips.push('• Include numbers (0–9)');
    if (!checks.hasSpecial) tips.push('• Add special chars (!@#$%^&*)');
    if (!checks.noRepeats)  tips.push('• Avoid repeating characters');
    if (!checks.noSequence) tips.push('• Avoid sequences like 123 or abc');

    return reply(
      `🔐 *Password Strength Checker*\n\n` +
      `Password: \`${'*'.repeat(Math.min(pw.length, 6))}...\`\n` +
      `Length: *${pw.length} chars*\n\n` +
      `${emoji} *${strength}* — ${pct}%\n` +
      `[${bar}]\n\n` +
      (tips.length
        ? `💡 *Tips to improve:*\n${tips.join('\n')}`
        : `✅ Excellent password! Keep it safe and don't reuse it.`)
    );
  },
};
