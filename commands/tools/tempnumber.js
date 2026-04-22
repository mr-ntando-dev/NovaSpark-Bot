/**
 * ⚡ NovaSpark Bot v5.3 — 2026 Edition
 * .tempnumber — Get a free temporary phone number for SMS verification
 * Fetches a live temp number from sms24.me (free, no login)
 * Shows number with personalised greeting to the requesting user
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

// Country options with flags
const COUNTRIES = {
  us:  { flag: '🇺🇸', name: 'United States' },
  uk:  { flag: '🇬🇧', name: 'United Kingdom' },
  ca:  { flag: '🇨🇦', name: 'Canada'         },
  au:  { flag: '🇦🇺', name: 'Australia'       },
  de:  { flag: '🇩🇪', name: 'Germany'         },
  fr:  { flag: '🇫🇷', name: 'France'          },
  ru:  { flag: '🇷🇺', name: 'Russia'          },
  in:  { flag: '🇮🇳', name: 'India'           },
  se:  { flag: '🇸🇪', name: 'Sweden'          },
  nl:  { flag: '🇳🇱', name: 'Netherlands'     },
  pl:  { flag: '🇵🇱', name: 'Poland'          },
  br:  { flag: '🇧🇷', name: 'Brazil'          },
  ph:  { flag: '🇵🇭', name: 'Philippines'     },
  id:  { flag: '🇮🇩', name: 'Indonesia'       },
  ng:  { flag: '🇳🇬', name: 'Nigeria'         },
};

// Providers and their free number APIs
const PROVIDERS = [
  {
    name: 'SMS24',
    listUrl: 'https://sms24.me/en/numbers',
    parseNumbers: (html) => {
      const matches = [...html.matchAll(/\+[\d\s\-()]{7,20}/g)];
      return matches.map(m => m[0].replace(/[\s\-()]/g, ''));
    },
  },
  {
    name: 'ReceiveSMS',
    listUrl: 'https://receive-smss.com/',
    parseNumbers: (html) => {
      const matches = [...html.matchAll(/\+[\d]{10,15}/g)];
      return [...new Set(matches.map(m => m[0]))].slice(0, 10);
    },
  },
];

async function fetchNumbers(country) {
  // Try multiple free SMS APIs
  const apis = [
    `https://sms-activate.io/api/getNumbersList`,
    `https://api.sms-man.com/stubs/handler_api.php`,
  ];

  // Primary: sms24.me phone numbers (scrape public list)
  try {
    const url = country
      ? `https://sms24.me/en/numbers/${country.toLowerCase()}`
      : 'https://sms24.me/en/numbers';
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    // Extract phone numbers from page
    const matches = [...data.matchAll(/\+[\d]{7,15}/g)];
    const numbers = [...new Set(matches.map(m => m[0]))].slice(0, 8);
    if (numbers.length > 0) return { source: 'sms24.me', numbers };
  } catch {}

  // Fallback: receivesmss.com
  try {
    const { data } = await axios.get('https://receivesmss.com/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const matches = [...data.matchAll(/\+[\d]{10,15}/g)];
    const numbers = [...new Set(matches.map(m => m[0]))].slice(0, 8);
    if (numbers.length > 0) return { source: 'receivesmss.com', numbers };
  } catch {}

  // Fallback 2: smsget.net
  try {
    const { data } = await axios.get('https://smsget.net/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const matches = [...data.matchAll(/\+[\d]{10,15}/g)];
    const numbers = [...new Set(matches.map(m => m[0]))].slice(0, 8);
    if (numbers.length > 0) return { source: 'smsget.net', numbers };
  } catch {}

  return null;
}

module.exports = {
  name: 'tempnumber',
  aliases: ['tmpnum', 'tempnum', 'tempsms', 'fakenumber', 'virtualnumber'],
  description: 'Get a free temporary phone number for SMS verification',
  category: 'tools',
  usage: '.tempnumber [country_code]\nExample: .tempnumber us',

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const countryArg = (args[0] || '').toLowerCase().replace(/[^a-z]/g, '');
    const countryInfo = COUNTRIES[countryArg] || null;
    const userNum = sender.split('@')[0];

    // Greet the user
    const greetText =
      `👋 *Hey +${userNum}!*\n` +
      `✨ _Welcome to NovaSpark Temp Number Service!_\n\n` +
      `🔍 Fetching free temporary numbers${countryInfo ? ` for *${countryInfo.flag} ${countryInfo.name}*` : ''}...\n` +
      `⏳ _Please wait a moment..._`;

    await sock.sendMessage(from, { text: greetText }, { quoted: msg });

    // Fetch numbers
    const result = await fetchNumbers(countryArg || null);

    if (!result || !result.numbers || result.numbers.length === 0) {
      // Give manual links as fallback
      return reply(
        `⚠️ *Could not auto-fetch numbers right now.*\n\n` +
        `📱 *Use these free temp number sites manually:*\n\n` +
        `🔗 https://sms24.me\n` +
        `🔗 https://receivesmss.com\n` +
        `🔗 https://smsget.net\n` +
        `🔗 https://receive-smss.com\n` +
        `🔗 https://freephonenum.com\n\n` +
        `_Pick any number, use it for verification, then check incoming SMS on the site._\n\n` +
        `_⚡ NovaSpark Bot — Dev-Ntando_`
      );
    }

    // Format output
    const countryLabel = countryInfo
      ? `${countryInfo.flag} *${countryInfo.name}*`
      : '🌍 *Mixed Countries*';

    const numberLines = result.numbers
      .map((n, i) => `  ${i + 1}. \`${n}\``)
      .join('\n');

    return reply(
      `📱 *Temp Numbers — ${countryLabel}*\n` +
      `${'━'.repeat(30)}\n\n` +
      `👤 *For:* +${userNum}\n` +
      `🌐 *Source:* ${result.source}\n` +
      `📋 *Numbers Available:*\n${numberLines}\n\n` +
      `${'━'.repeat(30)}\n` +
      `📌 *How to use:*\n` +
      `1️⃣ Copy a number above\n` +
      `2️⃣ Use it on the site you need to verify\n` +
      `3️⃣ Visit *${result.source}* to check incoming SMS\n\n` +
      `⚠️ _These are public numbers — do NOT use for banking or sensitive accounts!_\n\n` +
      `💡 *Available countries:* .tempnumber us | uk | ca | au | de | fr | ru | in | ng | ph\n\n` +
      `_⚡ NovaSpark Bot — Dev-Ntando_`
    );
  },
};
