/**
 * ⚡ NovaSpark Bot — Crypto Price Checker
 * .crypto <symbol>   — live price, 24h change, market cap
 * .crypto top        — top 5 cryptos by market cap
 * Uses CoinGecko public API (no key needed)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const ALIASES = {
  btc: 'bitcoin', eth: 'ethereum', bnb: 'binancecoin', sol: 'solana',
  xrp: 'ripple', doge: 'dogecoin', ada: 'cardano', trx: 'tron',
  matic: 'matic-network', dot: 'polkadot', link: 'chainlink', ltc: 'litecoin',
  avax: 'avalanche-2', shib: 'shiba-inu', uni: 'uniswap', atom: 'cosmos',
};

function fmt(n) {
  if (!n && n !== 0) return 'N/A';
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 6 })}`;
}

module.exports = {
  name: 'crypto',
  aliases: ['coin', 'price', 'cryptoprice'],
  category: 'tools',
  description: 'Live crypto prices from CoinGecko',
  usage: '.crypto <symbol/name> | .crypto top',

  async execute({ args, reply }) {
    const sub = (args[0] || '').toLowerCase().trim();
    if (!sub) return reply('💰 Usage: *.crypto <symbol>*\n\nExamples:\n  `.crypto btc`\n  `.crypto ethereum`\n  `.crypto top`');

    if (sub === 'top') {
      try {
        const { data } = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1',
          { timeout: 10000 }
        );
        const lines = data.map((c, i) =>
          `${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} *${c.symbol.toUpperCase()}* ${fmt(c.current_price)}  ${c.price_change_percentage_24h >= 0 ? '📈' : '📉'} ${c.price_change_percentage_24h?.toFixed(2)}%`
        ).join('\n');
        return reply(`📊 *Top 5 Cryptos (USD)*\n\n${lines}\n\n_Source: CoinGecko_`);
      } catch {
        return reply('❌ Could not fetch top coins right now.');
      }
    }

    const coinId = ALIASES[sub] || sub;
    try {
      const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
        { timeout: 10000 }
      );
      const p    = data.market_data;
      const chg  = p.price_change_percentage_24h;
      const chg7 = p.price_change_percentage_7d;

      return reply(
        `💰 *${data.name} (${data.symbol.toUpperCase()})*\n\n` +
        `💵 Price      : ${fmt(p.current_price?.usd)}\n` +
        `📈 24h Change : ${chg >= 0 ? '+' : ''}${chg?.toFixed(2)}%  ${chg >= 0 ? '🟢' : '🔴'}\n` +
        `📊 7d Change  : ${chg7 >= 0 ? '+' : ''}${chg7?.toFixed(2)}%\n` +
        `🏦 Market Cap : ${fmt(p.market_cap?.usd)}\n` +
        `📦 Volume 24h : ${fmt(p.total_volume?.usd)}\n` +
        `🔺 24h High   : ${fmt(p.high_24h?.usd)}\n` +
        `🔻 24h Low    : ${fmt(p.low_24h?.usd)}\n` +
        `🌐 Rank       : #${data.market_cap_rank || 'N/A'}\n\n` +
        `_${new Date().toLocaleString()} | CoinGecko_`
      );
    } catch (e) {
      if (e.response?.status === 404)
        return reply(`❌ Coin *${sub}* not found.\n\nTry the full name (e.g. \`bitcoin\`) or common symbols: btc, eth, bnb, sol, doge`);
      return reply('❌ Could not fetch crypto price. Try again!');
    }
  },
};
