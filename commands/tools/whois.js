/**
 * ⚡ NovaSpark Bot v11 — .whois
 * Look up a WhatsApp number: check if registered, get profile photo,
 * status, about text, and a "digital footprint" summary.
 * By Dev-Ntando
 */
'use strict';
const config = require('../../config');

// ── Country code lookup (top 50 by WA usage) ─────────────────────────────────
const COUNTRY_CODES = {
  '1':   'USA/Canada', '7': 'Russia/Kazakhstan', '20': 'Egypt',
  '27':  'South Africa', '30': 'Greece', '31': 'Netherlands',
  '32':  'Belgium', '33': 'France', '34': 'Spain', '36': 'Hungary',
  '39':  'Italy', '40': 'Romania', '41': 'Switzerland', '43': 'Austria',
  '44':  'UK', '45': 'Denmark', '46': 'Sweden', '47': 'Norway',
  '48':  'Poland', '49': 'Germany', '51': 'Peru', '52': 'Mexico',
  '53':  'Cuba', '54': 'Argentina', '55': 'Brazil', '56': 'Chile',
  '57':  'Colombia', '58': 'Venezuela', '60': 'Malaysia',
  '61':  'Australia', '62': 'Indonesia', '63': 'Philippines',
  '64':  'New Zealand', '65': 'Singapore', '66': 'Thailand',
  '81':  'Japan', '82': 'South Korea', '84': 'Vietnam',
  '86':  'China', '90': 'Turkey', '91': 'India', '92': 'Pakistan',
  '93':  'Afghanistan', '94': 'Sri Lanka', '98': 'Iran',
  '212': 'Morocco', '213': 'Algeria', '216': 'Tunisia',
  '218': 'Libya', '220': 'Gambia', '221': 'Senegal', '233': 'Ghana',
  '234': 'Nigeria', '237': 'Cameroon', '243': 'DR Congo',
  '244': 'Angola', '251': 'Ethiopia', '255': 'Tanzania',
  '256': 'Uganda', '260': 'Zambia', '263': 'Zimbabwe',
  '265': 'Malawi', '266': 'Lesotho', '267': 'Botswana',
  '268': 'Eswatini', '27': 'South Africa', '971': 'UAE',
  '966': 'Saudi Arabia', '974': 'Qatar', '973': 'Bahrain',
  '965': 'Kuwait', '968': 'Oman', '972': 'Israel/Palestine',
};

function getCountry(num) {
  // Try longest match first (e.g. 263 before 26)
  const clean = num.replace(/\D/g, '');
  for (const len of [3, 2, 1]) {
    const prefix = clean.slice(0, len);
    if (COUNTRY_CODES[prefix]) return { code: prefix, country: COUNTRY_CODES[prefix] };
  }
  return { code: '?', country: 'Unknown' };
}

module.exports = {
  name:        'whois',
  aliases:     ['lookup', 'numinfo', 'checknum', 'wacheck'],
  category:    'tools',
  description: 'Look up a WhatsApp number: registration status, profile, about, country',
  usage:       '.whois <number>  OR  .whois @tag  OR  reply to someone',

  execute: async ({ sock, msg, from, args, reply, sender }) => {
    // Resolve the target number
    let target = '';

    // From mention
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length) {
      target = mentions[0].split('@')[0];
    }
    // From reply
    else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      target = msg.message.extendedTextMessage.contextInfo.participant.split('@')[0];
    }
    // From args
    else if (args[0]) {
      target = args[0].replace(/[^0-9]/g, '');
    }

    if (!target || target.length < 7) {
      return reply([
        '🔍 *WhatsApp Number Lookup*',
        '',
        '*Usage:*',
        '  `.whois 263786831091`',
        '  `.whois @someone`',
        '  Reply to a message with `.whois`',
      ].join('\n'));
    }

    const jid = `${target}@s.whatsapp.net`;
    const { country } = getCountry(target);

    await sock.sendMessage(from, { text: `🔍 Looking up +${target}...` }, { quoted: msg });

    const result = {
      exists:  null,
      about:   '',
      picture: null,
      name:    '',
    };

    // Check if number exists on WhatsApp
    try {
      const [check] = await sock.onWhatsApp(target);
      result.exists = check?.exists === true;
    } catch { result.exists = null; }

    // Fetch profile picture URL
    try {
      result.picture = await sock.profilePictureUrl(jid, 'image');
    } catch { result.picture = null; }

    // Fetch status/about
    try {
      const status = await sock.fetchStatus(jid);
      result.about = status?.status || '';
    } catch {}

    // Build response
    const lines = [
      `👤 *WhatsApp Lookup*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📱 Number:  *+${target}*`,
      `🌍 Country: *${country}*`,
      `✅ On WhatsApp: ${result.exists === true ? '*Yes*' : result.exists === false ? '*No*' : '*Unknown*'}`,
    ];

    if (result.about) lines.push(`💬 About: _"${result.about}"_`);
    if (result.picture) lines.push(`🖼️ Profile photo: Available`);
    else lines.push(`🖼️ Profile photo: Not public`);

    lines.push('━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`_NovaSpark Bot v${config.botVersion}_`);

    // Send with profile picture if available
    if (result.picture) {
      try {
        await sock.sendMessage(from, {
          image: { url: result.picture },
          caption: lines.join('\n'),
        }, { quoted: msg });
        return;
      } catch {}
    }
    return reply(lines.join('\n'));
  },
};
