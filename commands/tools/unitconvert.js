/**
 * ⚡ NovaSpark Bot v8.0 — 2026 Edition
 * .convert <value> <from> <to> — Universal unit converter
 * By Dev-Ntando
 */
'use strict';

const UNITS = {
  // Length
  km: { base: 1000, type: 'length' }, m: { base: 1, type: 'length' },
  cm: { base: 0.01, type: 'length' }, mm: { base: 0.001, type: 'length' },
  mi: { base: 1609.344, type: 'length' }, yd: { base: 0.9144, type: 'length' },
  ft: { base: 0.3048, type: 'length' }, inch: { base: 0.0254, type: 'length' },
  // Weight
  kg: { base: 1, type: 'weight' }, g: { base: 0.001, type: 'weight' },
  lb: { base: 0.453592, type: 'weight' }, oz: { base: 0.0283495, type: 'weight' },
  t: { base: 1000, type: 'weight' },
  // Speed
  kmh: { base: 1, type: 'speed' }, mph: { base: 1.60934, type: 'speed' },
  ms: { base: 3.6, type: 'speed' }, knot: { base: 1.852, type: 'speed' },
  // Data
  b: { base: 1, type: 'data' }, kb: { base: 1024, type: 'data' },
  mb: { base: 1048576, type: 'data' }, gb: { base: 1073741824, type: 'data' },
  tb: { base: 1099511627776, type: 'data' },
  // Temperature — handled separately
};

function convertTemp(val, from, to) {
  let celsius;
  if (from === 'c') celsius = val;
  else if (from === 'f') celsius = (val - 32) * 5 / 9;
  else if (from === 'k') celsius = val - 273.15;
  else return null;

  if (to === 'c') return celsius;
  if (to === 'f') return celsius * 9 / 5 + 32;
  if (to === 'k') return celsius + 273.15;
  return null;
}

module.exports = {
  name: 'convert',
  aliases: ['unitconvert', 'conv'],
  description: '🔄 Universal unit converter (length, weight, speed, data, temp)',
  category: 'tools',

  execute: async ({ args, reply }) => {
    if (args.length < 3) {
      return reply(
        `🔄 *Unit Converter*\n${'━'.repeat(28)}\n\n` +
        `Usage: \`.convert <value> <from> <to>\`\n\n` +
        `*Length:* km · m · cm · mm · mi · yd · ft · inch\n` +
        `*Weight:* kg · g · lb · oz · t\n` +
        `*Speed:* kmh · mph · ms · knot\n` +
        `*Data:* b · kb · mb · gb · tb\n` +
        `*Temp:* c · f · k\n\n` +
        `Example: \`.convert 100 km mi\``
      );
    }

    const val  = parseFloat(args[0]);
    const from = args[1].toLowerCase();
    const to   = args[2].toLowerCase();

    if (isNaN(val)) return reply('❌ Value must be a number.');

    // Temperature
    if (['c', 'f', 'k'].includes(from) || ['c', 'f', 'k'].includes(to)) {
      const result = convertTemp(val, from, to);
      if (result === null) return reply('❌ Invalid temperature unit. Use c, f, or k.');
      const label = { c: '°C', f: '°F', k: 'K' };
      return reply(
        `🌡️ *Temperature Conversion*\n${'━'.repeat(28)}\n\n` +
        `${val}${label[from] || from} = *${result.toFixed(4)} ${label[to] || to}*\n\n` +
        `_⚡ NovaSpark Bot_`
      );
    }

    const uFrom = UNITS[from];
    const uTo   = UNITS[to];
    if (!uFrom) return reply(`❌ Unknown unit: \`${from}\``);
    if (!uTo)   return reply(`❌ Unknown unit: \`${to}\``);
    if (uFrom.type !== uTo.type) return reply(`❌ Cannot convert ${uFrom.type} to ${uTo.type}.`);

    const result = (val * uFrom.base) / uTo.base;
    return reply(
      `🔄 *Unit Conversion*\n${'━'.repeat(28)}\n\n` +
      `${val} ${from} = *${result.toFixed(6).replace(/\.?0+$/, '')} ${to}*\n` +
      `_(${uFrom.type})_\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
