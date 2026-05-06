/**
 * ⚡ NovaSpark v4 — Upgraded Weather Command
 * .weather <city> — 3-day forecast with hourly highs
 * Uses wttr.in (no API key needed)
 * By Dev-Ntando
 */
'use strict';
const axios = require('axios');

const WIND_DIR = ['N','NE','E','SE','S','SW','W','NW'];
function wdir(deg) { return WIND_DIR[Math.round(deg / 45) % 8]; }

module.exports = {
  name: 'weather',
  aliases: ['forecast', 'climate'],
  description: '🌤️ 3-day weather forecast for any city (no API key)',
  category: 'tools',

  execute: async ({ args, reply }) => {
    const city = args.join(' ').trim();
    if (!city) return reply('🌤️ Usage: `.weather <city>`\nExample: `.weather Harare`');

    await reply(`⏳ Fetching weather for *${city}*...`);
    try {
      const { data } = await axios.get(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        { timeout: 8000 }
      );
      const cur  = data.current_condition[0];
      const area = data.nearest_area[0];
      const loc  = `${area.areaName[0].value}, ${area.country[0].value}`;
      const desc = cur.weatherDesc[0].value;
      const temp = cur.temp_C;
      const feel = cur.FeelsLikeC;
      const hum  = cur.humidity;
      const wind = `${cur.windspeedKmph} km/h ${wdir(Number(cur.winddir16Point ? 0 : cur.winddirDegree))}`;
      const vis  = cur.visibility + ' km';
      const uv   = cur.uvIndex;

      const days = data.weather.slice(0, 3).map(d => {
        const date = new Date(d.date).toLocaleDateString('en-ZA', { weekday:'short', month:'short', day:'numeric' });
        return (
          `📅 *${date}*\n` +
          `  🌡️ ${d.mintempC}°C – ${d.maxtempC}°C\n` +
          `  ${d.hourly[4]?.weatherDesc[0]?.value || ''}`
        );
      }).join('\n');

      return reply(
        `🌤️ *Weather: ${loc}*\n` +
        `${'━'.repeat(30)}\n\n` +
        `🌡️ *Temp:* ${temp}°C (feels ${feel}°C)\n` +
        `☁️  *Condition:* ${desc}\n` +
        `💧 *Humidity:* ${hum}%\n` +
        `💨 *Wind:* ${wind}\n` +
        `👁️  *Visibility:* ${vis}\n` +
        `☀️  *UV Index:* ${uv}\n\n` +
        `${'─'.repeat(26)}\n` +
        `*3-Day Forecast:*\n${days}\n\n` +
        `_⚡ NovaSpark Bot v4_`
      );
    } catch {
      return reply(`❌ Could not fetch weather for *${city}*.\nCheck the city name and try again.`);
    }
  },
};
