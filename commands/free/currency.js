/**
 * NovaSpark Bot v3 — Live Currency Converter
 * .currency <amount> <FROM> <TO>
 * Uses the free exchangerate-api.com open endpoint (no key needed)
 * By Dev-Ntando
 */
'use strict';

const axios    = require('axios');
const database = require('../../database');

// Common currency names for nicer display
const NAMES = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', ZAR: 'South African Rand',
  ZWL: 'Zimbabwean Dollar', KES: 'Kenyan Shilling', NGN: 'Nigerian Naira',
  GHS: 'Ghanaian Cedi', TZS: 'Tanzanian Shilling', UGX: 'Ugandan Shilling',
  JPY: 'Japanese Yen', CNY: 'Chinese Yuan', INR: 'Indian Rupee',
  BTC: 'Bitcoin', ETH: 'Ethereum', AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar', CHF: 'Swiss Franc', MXN: 'Mexican Peso',
  BRL: 'Brazilian Real', EGP: 'Egyptian Pound', MAD: 'Moroccan Dirham',
};

module.exports = {
  name: 'currency',
  aliases: ['fx', 'exchange'],
  description: 'Real-time currency conversion — .currency 100 USD ZAR',
  category: 'free',

  execute: async ({ sock, from, sender, args, reply }) => {
    database.logCommand(sender, 'currency');

    if (args.length < 3) {
      return reply(
        '💱 *Currency Converter*\n\n' +
        'Usage: *.currency <amount> <FROM> <TO>*\n\n' +
        'Examples:\n' +
        '  .currency 100 USD ZAR\n' +
        '  .currency 50 GBP USD\n' +
        '  .currency 1000 ZAR EUR\n' +
        '  .currency 1 BTC USD\n\n' +
        '_Supports 150+ currencies_'
      );
    }

    const rawAmount = parseFloat(args[0].replace(/,/g, ''));
    const from_cur  = args[1].toUpperCase().trim();
    const to_cur    = args[2].toUpperCase().trim();

    if (isNaN(rawAmount) || rawAmount <= 0) {
      return reply('❌ Invalid amount. Use a positive number.\nExample: *.currency 100 USD ZAR*');
    }

    await sock.sendPresenceUpdate('composing', from);

    try {
      // exchangerate-api open endpoint — completely free, no key, 1500 req/month
      const { data } = await axios.get(
        `https://open.er-api.com/v6/latest/${from_cur}`,
        { timeout: 10000 }
      );

      if (data.result === 'error') {
        return reply(`❌ Unknown currency: *${from_cur}*. Use a valid ISO code like USD, EUR, GBP.`);
      }

      const rate = data.rates[to_cur];
      if (!rate) {
        return reply(`❌ Unknown target currency: *${to_cur}*. Use a valid ISO code.`);
      }

      const converted = rawAmount * rate;
      const fromName  = NAMES[from_cur] || from_cur;
      const toName    = NAMES[to_cur]   || to_cur;

      // Format numbers nicely
      const fmt = (n) => n >= 1 ? n.toLocaleString('en-US', { maximumFractionDigits: 2 })
                                 : n.toFixed(6).replace(/\.?0+$/, '');

      const lastUpdated = data.time_last_update_utc
        ? new Date(data.time_last_update_utc).toLocaleString('en-ZA', { timeZone: 'Africa/Harare', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'recently';

      const reply_msg =
        `💱 *Currency Conversion*\n` +
        `${'─'.repeat(28)}\n\n` +
        `  *${fmt(rawAmount)} ${from_cur}*  →  *${fmt(converted)} ${to_cur}*\n\n` +
        `  📌 Rate: 1 ${from_cur} = ${fmt(rate)} ${to_cur}\n` +
        `  🏷️  ${fromName} → ${toName}\n` +
        `  🕐 Updated: ${lastUpdated}\n\n` +
        `_Nova AI ⚡ | Rates by open.er-api.com_`;

      await reply(reply_msg);
    } catch (err) {
      console.error('[currency]', err.message);
      await reply('❌ Could not fetch exchange rates right now. Try again in a moment.');
    }
  },
};
