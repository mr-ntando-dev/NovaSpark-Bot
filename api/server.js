/**
 * NovaSpark Bot API Server v8.0
 * Deployable on Render (free tier)
 *
 * Endpoints:
 *   GET  /                    - API info + status
 *   GET  /health              - Health check (Render keep-alive)
 *   GET  /api/status          - Bot runtime stats
 *   GET  /api/fact            - Random fact
 *   GET  /api/joke            - Random joke
 *   GET  /api/quote           - Random quote
 *   GET  /api/advice          - Random advice
 *   GET  /api/motivate        - Random motivational quote
 *   GET  /api/meme            - Random meme URL
 *   GET  /api/riddle          - Random riddle
 *   GET  /api/8ball?q=        - Magic 8-ball
 *   GET  /api/weather?city=   - Weather (requires OPENWEATHER_KEY)
 *   GET  /api/crypto?coin=    - Crypto price
 *   GET  /api/truthfact       - Mind-blowing fact
 *   GET  /api/zodiac?sign=    - Zodiac reading
 *   POST /api/shorten         - Shorten URL { url }
 *
 * By Dev-Ntando | NovaSpark Bot v8.0
 */

'use strict';

const http  = require('http');
const https = require('https');
const url   = require('url');
const os    = require('os');

const PORT    = process.env.PORT || 3000;
const API_KEY = process.env.NOVASPARK_API_KEY || null; // optional auth

// ── Data ─────────────────────────────────────────────────────────────────────
const FACTS = [
  'Honey never spoils. Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.',
  'A group of flamingos is called a flamboyance.',
  'Wombats are the only animals that produce cube-shaped poop.',
  'The Eiffel Tower can grow 15 cm taller in summer due to thermal expansion.',
  'Sharks are older than trees — they existed 450M years ago, trees only 350M.',
  'Cleopatra lived closer in time to the Moon landing than to the building of the pyramids.',
  'Octopuses have three hearts, blue blood, and can taste with their suckers.',
  'A bolt of lightning contains enough energy to toast 100,000 slices of bread.',
  'The human eye can detect approximately 10 million different colors.',
  'Bananas are technically berries, but strawberries are not.',
];

const JOKES = [
  { setup: 'Why do programmers prefer dark mode?', punchline: 'Because light attracts bugs.' },
  { setup: 'Why did the scarecrow win an award?', punchline: 'He was outstanding in his field.' },
  { setup: 'Why do cows wear bells?', punchline: 'Because their horns don\'t work.' },
  { setup: 'What do you call a fake noodle?', punchline: 'An impasta.' },
  { setup: 'Why don\'t scientists trust atoms?', punchline: 'Because they make up everything.' },
  { setup: 'I told my doctor I broke my arm in two places.', punchline: 'He told me to stop going to those places.' },
  { setup: 'What do you call cheese that isn\'t yours?', punchline: 'Nacho cheese.' },
  { setup: 'Why do seagulls fly over the sea?', punchline: 'Because if they flew over the bay they would be bagels.' },
];

const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It is not the strongest of the species that survives, but the most adaptable.', author: 'Charles Darwin' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Success is not final, failure is not fatal: It is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
  { text: 'Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe.', author: 'Albert Einstein' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
];

const ADVICE = [
  'Drink more water. Most problems are solved by hydration and sleep.',
  'Read one page of a book every day. A year later you\'ll have finished 12 books.',
  'Say less. Listen more. You\'ll learn things that talkers never do.',
  'Spend money on experiences, not things. Things rust. Memories don\'t.',
  'Write down three things you\'re grateful for every morning. It rewires your brain.',
  'Never make permanent decisions based on temporary emotions.',
  'The person who reads a lot becomes very difficult to beat.',
  'Comparison is the thief of joy. Run your own race.',
  'Your future self is watching you right now through your memories.',
  'Sleep is not laziness. It is the most productive recovery tool you have.',
];

const RIDDLES = [
  { riddle: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', answer: 'An echo' },
  { riddle: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps' },
  { riddle: 'I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?', answer: 'A map' },
  { riddle: 'I can fly without wings. I can cry without eyes. Wherever I go, darkness flies. What am I?', answer: 'A cloud' },
  { riddle: 'What has hands but cannot clap?', answer: 'A clock' },
];

const EIGHT_BALL = [
  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes definitely.',
  'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
  'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
  'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
  'Don\'t count on it.', 'My reply is no.', 'My sources say no.',
  'Outlook not so good.', 'Very doubtful.',
];

const MEMES = [
  'https://i.imgur.com/PlOr9WC.jpeg',
  'https://i.imgur.com/UkH6EiB.jpeg',
  'https://i.imgur.com/1jXhH4i.jpeg',
  'https://i.imgur.com/YSRM91j.jpeg',
  'https://i.imgur.com/JtNLqfP.jpeg',
];

const ZODIAC = {
  aries:       { emoji: 'Aries (Mar 21 - Apr 19)', element: 'Fire', today: 'Energy is high. Trust your instincts and take the first move.' },
  taurus:      { emoji: 'Taurus (Apr 20 - May 20)', element: 'Earth', today: 'Slow and steady wins today. Focus on finances and planning.' },
  gemini:      { emoji: 'Gemini (May 21 - Jun 20)', element: 'Air', today: 'Your mind is sharp. A conversation opens new doors today.' },
  cancer:      { emoji: 'Cancer (Jun 21 - Jul 22)', element: 'Water', today: 'Protect your peace. Home and family bring comfort today.' },
  leo:         { emoji: 'Leo (Jul 23 - Aug 22)', element: 'Fire', today: 'All eyes on you. Step into the spotlight -- you belong there.' },
  virgo:       { emoji: 'Virgo (Aug 23 - Sep 22)', element: 'Earth', today: 'Details matter today. Your precision solves a long-standing problem.' },
  libra:       { emoji: 'Libra (Sep 23 - Oct 22)', element: 'Air', today: 'Balance is your superpower. A compromise leads to harmony.' },
  scorpio:     { emoji: 'Scorpio (Oct 23 - Nov 21)', element: 'Water', today: 'Depth over surface. Seek truth and you will find it.' },
  sagittarius: { emoji: 'Sagittarius (Nov 22 - Dec 21)', element: 'Fire', today: 'Explore something new. An unexpected adventure awaits.' },
  capricorn:   { emoji: 'Capricorn (Dec 22 - Jan 19)', element: 'Earth', today: 'Hard work pays off today. Stay focused and success follows.' },
  aquarius:    { emoji: 'Aquarius (Jan 20 - Feb 18)', element: 'Air', today: 'Think outside the box. Your unconventional idea is the right one.' },
  pisces:      { emoji: 'Pisces (Feb 19 - Mar 20)', element: 'Water', today: 'Trust your feelings. A dream from last night carries a message.' },
};

// ── Helper ────────────────────────────────────────────────────────────────────
const rand   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const json   = (res, data, status = 200) => {
  const body = JSON.stringify({ success: true, ...data }, null, 2);
  res.writeHead(status, {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Powered-By':                'NovaSpark Bot v8.0',
  });
  res.end(body);
};
const err    = (res, msg, status = 400) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ success: false, error: msg }));
};

const startTime = Date.now();

// ── Fetch helper ──────────────────────────────────────────────────────────────
function get(apiUrl) {
  return new Promise((resolve, reject) => {
    const mod = apiUrl.startsWith('https') ? https : http;
    const req = mod.get(apiUrl, { headers: { 'User-Agent': 'NovaSpark-API/8.0' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ── Router ────────────────────────────────────────────────────────────────────
const routes = {

  'GET /': (req, res) => {
    json(res, {
      name:        'NovaSpark Bot API',
      version:     '8.0.0',
      description: 'The Most Advanced WA Bot API - by Dev-Ntando',
      uptime:      Math.floor((Date.now() - startTime) / 1000) + 's',
      endpoints: [
        'GET  /health',
        'GET  /api/status',
        'GET  /api/fact',
        'GET  /api/joke',
        'GET  /api/quote',
        'GET  /api/advice',
        'GET  /api/motivate',
        'GET  /api/riddle',
        'GET  /api/truthfact',
        'GET  /api/meme',
        'GET  /api/8ball?q=your+question',
        'GET  /api/weather?city=Harare',
        'GET  /api/crypto?coin=bitcoin',
        'GET  /api/zodiac?sign=aries',
        'POST /api/shorten  { "url": "..." }',
      ],
    });
  },

  'GET /health': (req, res) => {
    json(res, {
      status:  'ok',
      uptime:  Math.floor((Date.now() - startTime) / 1000) + 's',
      memory:  Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      node:    process.version,
      time:    new Date().toISOString(),
    });
  },

  'GET /api/status': (req, res) => {
    const up = Date.now() - startTime;
    json(res, {
      bot:     'NovaSpark Bot v8.0',
      status:  'online',
      uptime:  `${Math.floor(up/3600000)}h ${Math.floor((up%3600000)/60000)}m ${Math.floor((up%60000)/1000)}s`,
      memory:  `${Math.round(process.memoryUsage().heapUsed/1024/1024)}MB / ${Math.round(process.memoryUsage().heapTotal/1024/1024)}MB`,
      node:    process.version,
      platform:os.platform(),
      time:    new Date().toISOString(),
      authors: ['Dev-Ntando'],
      owners:  ['263777124998', '263786831091'],
    });
  },

  'GET /api/fact': (req, res) => {
    json(res, { fact: rand(FACTS), source: 'NovaSpark Bot' });
  },

  'GET /api/joke': (req, res) => {
    const j = rand(JOKES);
    json(res, { setup: j.setup, punchline: j.punchline });
  },

  'GET /api/quote': (req, res) => {
    const q = rand(QUOTES);
    json(res, { quote: q.text, author: q.author });
  },

  'GET /api/advice': (req, res) => {
    json(res, { advice: rand(ADVICE), source: 'NovaSpark Bot' });
  },

  'GET /api/motivate': (req, res) => {
    const q = rand(QUOTES);
    json(res, { motivation: q.text, author: q.author, tip: rand(ADVICE) });
  },

  'GET /api/riddle': (req, res) => {
    const r = rand(RIDDLES);
    json(res, { riddle: r.riddle, answer: r.answer });
  },

  'GET /api/truthfact': (req, res) => {
    json(res, { fact: rand(FACTS), type: 'mind-blowing', source: 'NovaSpark Bot' });
  },

  'GET /api/meme': (req, res) => {
    json(res, { meme_url: rand(MEMES), source: 'NovaSpark Bot' });
  },

  'GET /api/8ball': (req, res, query) => {
    const q = query.q || query.question || query.ask;
    if (!q) return err(res, 'Missing query param: ?q=your+question');
    const answer = rand(EIGHT_BALL);
    const type   = EIGHT_BALL.indexOf(answer) < 10 ? 'positive' : EIGHT_BALL.indexOf(answer) < 15 ? 'neutral' : 'negative';
    json(res, { question: q, answer, type });
  },

  'GET /api/weather': async (req, res, query) => {
    const city = query.city || query.q;
    if (!city) return err(res, 'Missing query param: ?city=CityName');
    const apiKey = process.env.OPENWEATHER_KEY;
    if (!apiKey) return err(res, 'OPENWEATHER_KEY not configured on server', 503);
    try {
      const data = await get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
      if (data.cod !== 200 && data.cod !== '200') return err(res, data.message || 'City not found', 404);
      json(res, {
        city:        data.name,
        country:     data.sys?.country,
        temp:        data.main?.temp + '\u00B0C',
        feels_like:  data.main?.feels_like + '\u00B0C',
        humidity:    data.main?.humidity + '%',
        description: data.weather?.[0]?.description,
        wind:        data.wind?.speed + ' m/s',
        icon:        `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon}@2x.png`,
      });
    } catch (e) {
      err(res, 'Failed to fetch weather: ' + e.message, 500);
    }
  },

  'GET /api/crypto': async (req, res, query) => {
    const coin = (query.coin || query.c || 'bitcoin').toLowerCase();
    try {
      const data = await get(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=usd,eur,zar&include_24hr_change=true`);
      if (!data[coin]) return err(res, `Coin not found: ${coin}`, 404);
      const c = data[coin];
      json(res, {
        coin,
        price_usd: '$' + c.usd?.toLocaleString(),
        price_eur: '\u20AC' + c.eur?.toLocaleString(),
        price_zar: 'R' + c.zar?.toLocaleString(),
        change_24h: (c.usd_24h_change || 0).toFixed(2) + '%',
        source: 'CoinGecko',
      });
    } catch (e) {
      err(res, 'Failed to fetch crypto: ' + e.message, 500);
    }
  },

  'GET /api/zodiac': (req, res, query) => {
    const sign = (query.sign || query.s || '').toLowerCase();
    if (!sign) return err(res, 'Missing query param: ?sign=aries');
    const z = ZODIAC[sign];
    if (!z) return err(res, `Unknown sign: ${sign}. Valid: ${Object.keys(ZODIAC).join(', ')}`, 404);
    json(res, { sign, ...z });
  },

  'POST /api/shorten': async (req, res) => {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const target = parsed.url;
        if (!target) return err(res, 'Body must include { "url": "..." }');
        const data = await get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`);
        json(res, { original: target, short: data });
      } catch (e) {
        err(res, 'Failed to shorten URL: ' + e.message, 500);
      }
    });
  },
};

// ── Auth middleware ───────────────────────────────────────────────────────────
function checkAuth(req, res) {
  if (!API_KEY) return true;
  const key = req.headers['x-api-key'] || new url.URL('http://x' + req.url).searchParams.get('api_key');
  if (key === API_KEY) return true;
  err(res, 'Unauthorized. Provide X-API-Key header or ?api_key=...', 401);
  return false;
}

// ── Server ────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsed  = new url.URL('http://localhost' + req.url);
  const path    = parsed.pathname.replace(/\/$/, '') || '/';
  const query   = Object.fromEntries(parsed.searchParams.entries());
  const method  = req.method.toUpperCase();
  const key     = `${method} ${path}`;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*' });
    return res.end();
  }

  // Skip auth for health
  if (path === '/health') return routes['GET /health'](req, res, query);

  if (!checkAuth(req, res)) return;

  const handler = routes[key];
  if (handler) {
    Promise.resolve(handler(req, res, query)).catch(e => err(res, 'Internal error: ' + e.message, 500));
  } else {
    err(res, `Route not found: ${method} ${path}. GET / for available endpoints.`, 404);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n\u26A1 NovaSpark Bot API v8.0 running on port ${PORT}`);
  console.log(`   GET http://localhost:${PORT}/ for API info\n`);
});

module.exports = server;
