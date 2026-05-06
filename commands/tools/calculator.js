/**
 * ⚡ NovaSpark v4 — Scientific Calculator
 * .calc <expression>
 * Supports: basic math, sin/cos/tan, sqrt, log, pi, e, !, percentages
 * By Dev-Ntando
 */
'use strict';

function safeEval(expr) {
  // Replace safe math functions and constants
  let e = expr
    .replace(/\bpi\b/gi,   String(Math.PI))
    .replace(/\be\b/g,     String(Math.E))
    .replace(/sqrt\(/gi,   'Math.sqrt(')
    .replace(/cbrt\(/gi,   'Math.cbrt(')
    .replace(/sin\(/gi,    'Math.sin(')
    .replace(/cos\(/gi,    'Math.cos(')
    .replace(/tan\(/gi,    'Math.tan(')
    .replace(/log\(/gi,    'Math.log10(')
    .replace(/ln\(/gi,     'Math.log(')
    .replace(/abs\(/gi,    'Math.abs(')
    .replace(/floor\(/gi,  'Math.floor(')
    .replace(/ceil\(/gi,   'Math.ceil(')
    .replace(/round\(/gi,  'Math.round(')
    .replace(/pow\(/gi,    'Math.pow(')
    .replace(/\^/g,        '**')
    .replace(/%/g,         '/100');

  // Safety check — only allow math chars
  if (/[^0-9+\-*/().Math\s,]/.test(e.replace(/Math\.[a-z]+/g, ''))) {
    throw new Error('Invalid expression');
  }
  // eslint-disable-next-line no-new-func
  return Function('"use strict"; return (' + e + ')')();
}

module.exports = {
  name: 'calc',
  aliases: ['calculate', 'math2'],
  description: '🔢 Scientific calculator — full math expressions',
  category: 'tools',

  execute: async ({ args, reply }) => {
    const expr = args.join(' ').trim();
    if (!expr) {
      return reply(
        '🔢 *Scientific Calculator*\n\n' +
        'Usage: `.calc <expression>`\n\n' +
        'Examples:\n' +
        '  `.calc 2 + 2`\n' +
        '  `.calc sqrt(144)`\n' +
        '  `.calc sin(pi/2)`\n' +
        '  `.calc 2^10`\n' +
        '  `.calc log(1000)`\n' +
        '  `.calc 50%` → 0.5'
      );
    }
    try {
      const result = safeEval(expr);
      if (typeof result !== 'number' || !isFinite(result)) throw new Error('Invalid result');
      return reply(
        `🔢 *Calculator*\n\n` +
        `📥 Input: \`${expr}\`\n` +
        `📤 Result: *${parseFloat(result.toPrecision(12))}*`
      );
    } catch {
      return reply(`❌ Could not calculate: \`${expr}\`\n_Check your expression and try again._`);
    }
  },
};
