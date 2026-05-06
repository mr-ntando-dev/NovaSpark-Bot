/**
 * ⚡ NovaSpark Bot — IP Lookup
 * .ip <address>   — location, ISP, timezone info for any IP
 * .myip           — check the bot's outgoing IP
 * No API key required (ip-api.com free tier)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

module.exports = {
  name: 'ip',
  aliases: ['iplookup', 'ipinfo', 'myip'],
  category: 'tools',
  description: 'Look up IP address location and ISP info',
  usage: '.ip <address> | .myip',

  async execute({ args, reply, body }) {
    const isMyIp = body.trim().replace(/^\./, '').split(' ')[0] === 'myip';
    const target = isMyIp ? '' : (args[0] || '').trim();

    try {
      const url  = target ? `http://ip-api.com/json/${target}?fields=66846719` : 'http://ip-api.com/json/?fields=66846719';
      const { data } = await axios.get(url, { timeout: 8000 });

      if (data.status === 'fail') return reply(`❌ ${data.message || 'Invalid IP address or query failed.'}`);

      return reply(
        `🌐 *IP Info*\n\n` +
        `📡 IP        : \`${data.query}\`\n` +
        `📍 Location  : ${data.city}, ${data.regionName}, ${data.country} ${data.countryCode ? `(${data.countryCode})` : ''}\n` +
        `🗺️  Lat/Lon   : ${data.lat}, ${data.lon}\n` +
        `🏢 ISP       : ${data.isp || 'N/A'}\n` +
        `🏦 Org       : ${data.org || 'N/A'}\n` +
        `🕐 Timezone  : ${data.timezone || 'N/A'}\n` +
        `📮 ZIP       : ${data.zip || 'N/A'}\n` +
        `🔒 Proxy/VPN : ${data.proxy ? 'Yes ⚠️' : 'No'}\n` +
        `🌍 ASN       : ${data.as || 'N/A'}\n\n` +
        `_Powered by ip-api.com_`
      );
    } catch {
      return reply('❌ Could not perform IP lookup. Try again!');
    }
  },
};
