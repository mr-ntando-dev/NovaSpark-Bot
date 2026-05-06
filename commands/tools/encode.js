/**
 * ⚡ NovaSpark Bot v5 — 2026 Edition
 * .encode <type> <text> — Encode text (base64 / hex / reverse / morse)
 * .decode <type> <text> — Decode text (base64 / hex)
 * By Dev-Ntando
 */
'use strict';

const MORSE = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',
  N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','(':'-.--.', ')':'-.--.-','&':'.-...',
  ':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','–':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.',' ':' / ',
};
// reverse morse map
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

function toMorse(text) {
  return text.toUpperCase().split('').map(c => MORSE[c] || c).join(' ');
}
function fromMorse(text) {
  return text.split(' / ').map(word => word.split(' ').map(c => MORSE_REV[c] || c).join('')).join(' ');
}

module.exports = {
  name: 'encode',
  aliases: ['decode', 'cipher'],
  description: 'Encode / decode text: base64, hex, reverse, morse',
  category: 'tools',
  usage: '.encode <base64|hex|reverse|morse> <text>\n.decode <base64|hex|morse> <text>',

  execute: async ({ sock, msg, from, args, reply, sender }) => {
    const action = (msg.body || '').toLowerCase().startsWith('.decode') ? 'decode' : 'encode';
    const type   = (args[0] || '').toLowerCase();
    const text   = args.slice(1).join(' ');

    if (!type || !text) {
      return reply(
        `🔐 *Encode / Decode*\n\n` +
        `*Encode:*\n` +
        `• .encode base64 Hello World\n` +
        `• .encode hex Hello World\n` +
        `• .encode reverse Hello World\n` +
        `• .encode morse Hello World\n\n` +
        `*Decode:*\n` +
        `• .decode base64 SGVsbG8gV29ybGQ=\n` +
        `• .decode hex 48656c6c6f\n` +
        `• .decode morse .... . .-.. .-.. ---\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    let result;
    try {
      if (action === 'encode') {
        if (type === 'base64')  result = Buffer.from(text).toString('base64');
        else if (type === 'hex') result = Buffer.from(text).toString('hex');
        else if (type === 'reverse') result = text.split('').reverse().join('');
        else if (type === 'morse') result = toMorse(text);
        else return reply(`❌ Unknown type. Use: *base64 | hex | reverse | morse*`);
      } else {
        if (type === 'base64')  result = Buffer.from(text, 'base64').toString('utf8');
        else if (type === 'hex') result = Buffer.from(text.replace(/\s/g,''), 'hex').toString('utf8');
        else if (type === 'morse') result = fromMorse(text);
        else return reply(`❌ Unknown type. Use: *base64 | hex | morse*`);
      }
    } catch {
      return reply('❌ Failed to process. Check your input and try again.');
    }

    return reply(
      `🔐 *${action === 'encode' ? 'Encoded' : 'Decoded'} (${type})*\n\n` +
      `📥 *Input:*\n${text}\n\n` +
      `📤 *Result:*\n${result}\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
