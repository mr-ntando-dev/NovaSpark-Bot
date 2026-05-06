/**
 * NovaSpark Bot — Weather Command (Free)
 * .weather <city>
 * Also used internally by the smart auto-detector
 */
'use strict';

const axios    = require('axios');
const APIs     = require('../../utils/api');
const database = require('../../database');

// ── Weather emoji map ─────────────────────────────────────────────────────────
const weatherEmoji = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) return '⛈️';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return '🌧️';
  if (d.includes('snow') || d.includes('sleet') || d.includes('blizzard')) return '❄️';
  if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return '🌫️';
  if (d.includes('cloud') || d.includes('overcast')) return '☁️';
  if (d.includes('partly') || d.includes('scattered')) return '⛅';
  if (d.includes('clear') || d.includes('sunny') || d.includes('fair')) return '☀️';
  if (d.includes('wind') || d.includes('breezy')) return '💨';
  return '🌤️';
};

// ── Fetch weather from wttr.in (free, no key needed) ─────────────────────────
async function fetchWeather(city) {
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
  const res  = await axios.get(url, { timeout: 12000, headers: { 'Accept': 'application/json' } });
  const d    = res.data;
  const cur  = d.current_condition?.[0];
  const area = d.nearest_area?.[0];

  if (!cur) throw new Error('No weather data');

  const areaName    = area?.areaName?.[0]?.value    || city;
  const country     = area?.country?.[0]?.value     || '';
  const tempC       = cur.temp_C;
  const tempF       = cur.temp_F;
  const feelsC      = cur.FeelsLikeC;
  const desc        = cur.weatherDesc?.[0]?.value || 'N/A';
  const humidity    = cur.humidity;
  const windKmph    = cur.windspeedKmph;
  const windDir     = cur.winddir16Point;
  const visibility  = cur.visibility;
  const uvIndex     = cur.uvIndex;
  const emoji       = weatherEmoji(desc);

  // Today's forecast
  const today       = d.weather?.[0];
  const maxC        = today?.maxtempC;
  const minC        = today?.mintempC;
  const sunrise     = today?.astronomy?.[0]?.sunrise;
  const sunset      = today?.astronomy?.[0]?.sunset;

  return {
    areaName, country, tempC, tempF, feelsC,
    desc, humidity, windKmph, windDir, visibility,
    uvIndex, maxC, minC, sunrise, sunset, emoji,
  };
}

// ── Format weather reply ──────────────────────────────────────────────────────
function formatWeather(w) {
  return (
    `${w.emoji} *Weather — ${w.areaName}${w.country ? ', ' + w.country : ''}*\n\n` +
    `🌡️ *Temp:* ${w.tempC}°C / ${w.tempF}°F  _(feels like ${w.feelsC}°C)_\n` +
    `🌥️ *Condition:* ${w.desc}\n` +
    `💧 *Humidity:* ${w.humidity}%\n` +
    `💨 *Wind:* ${w.windKmph} km/h ${w.windDir}\n` +
    `👁️ *Visibility:* ${w.visibility} km\n` +
    `☀️ *UV Index:* ${w.uvIndex}\n` +
    `📈 *Today High/Low:* ${w.maxC}°C / ${w.minC}°C\n` +
    `🌅 *Sunrise:* ${w.sunrise || 'N/A'}   🌇 *Sunset:* ${w.sunset || 'N/A'}`
  );
}

// ── Command export ────────────────────────────────────────────────────────────
module.exports = {
  name: 'weather',
  aliases: ['w', 'forecast', 'temp'],
  description: 'Get real-time weather for any city (free)',
  category: 'free',

  // Used by auto-detector
  fetchWeather,
  formatWeather,

  execute: async ({ sock, from, sender, args, reply }) => {
    database.logCommand(sender, 'weather');
    const city = args.join(' ').trim();
    if (!city) return reply('🌤️ Usage: *.weather <city>*\nExample: *.weather Harare*');

    await sock.sendPresenceUpdate('composing', from);
    await reply('🌍 Checking weather...');

    try {
      const w    = await fetchWeather(city);
      const text = formatWeather(w);
      await reply(`${text}\n\n_Nova AI ⚡_`);
    } catch {
      // Fallback to AI-generated estimate
      try {
        const aiReply = await APIs.chatAI(
          `Give the current typical weather for ${city}. Include temperature, conditions, humidity, wind. Be brief and use bullet points. Mention you are giving a typical estimate, not live data.`
        );
        await reply(`🌤️ *Weather — ${city}*\n\n${aiReply}\n\n_Nova AI ⚡_`);
      } catch {
        await reply(`❌ Could not fetch weather for *${city}*. Check the city name and try again.`);
      }
    }
  },
};
