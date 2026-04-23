# NovaSpark Bot API

The NovaSpark Bot REST API — deployable on [Render](https://render.com) for free.

## Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New Web Service**
3. Connect your GitHub repo: `dev-modder/NovaSpark-Bot`
4. Set **Start Command** to: `node api/server.js`
5. Set **Build Command** to: `npm install`
6. Set environment variables:
   - `PORT` = `10000` (Render sets this automatically)
   - `NOVASPARK_API_KEY` = your secret key (optional, protects the API)
   - `OPENWEATHER_KEY` = from [openweathermap.org](https://openweathermap.org/api) (free tier)
7. Click **Deploy**

Your API will be live at: `https://novaspark-api.onrender.com`

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info + all endpoints |
| GET | `/health` | Health check (no auth required) |
| GET | `/api/status` | Bot runtime stats |
| GET | `/api/fact` | Random interesting fact |
| GET | `/api/joke` | Random joke (setup + punchline) |
| GET | `/api/quote` | Famous quote |
| GET | `/api/advice` | Life advice |
| GET | `/api/motivate` | Motivational quote + tip |
| GET | `/api/riddle` | Brain teaser + answer |
| GET | `/api/truthfact` | Mind-blowing true fact |
| GET | `/api/meme` | Random meme image URL |
| GET | `/api/8ball?q=...` | Magic 8-ball answer |
| GET | `/api/weather?city=...` | Weather forecast (requires OPENWEATHER_KEY) |
| GET | `/api/crypto?coin=...` | Crypto price (USD/EUR/ZAR) |
| GET | `/api/zodiac?sign=...` | Zodiac daily reading |
| POST | `/api/shorten` | Shorten a URL `{ "url": "..." }` |

---

## Authentication (Optional)

Set `NOVASPARK_API_KEY` in Render environment variables.

Then pass it with every request:

```
# Via header
curl -H "X-API-Key: your_key" https://novaspark-api.onrender.com/api/fact

# Via query param
curl https://novaspark-api.onrender.com/api/fact?api_key=your_key
```

If `NOVASPARK_API_KEY` is not set, all requests are allowed without auth.
`/health` always bypasses auth.

---

## Example Responses

### GET /api/joke
```json
{
  "success": true,
  "setup": "Why do programmers prefer dark mode?",
  "punchline": "Because light attracts bugs."
}
```

### GET /api/8ball?q=Will+I+win+today
```json
{
  "success": true,
  "question": "Will I win today",
  "answer": "It is certain.",
  "type": "positive"
}
```

### GET /api/crypto?coin=bitcoin
```json
{
  "success": true,
  "coin": "bitcoin",
  "price_usd": "$67,420",
  "price_eur": "€62,100",
  "price_zar": "R1,234,567",
  "change_24h": "+2.34%",
  "source": "CoinGecko"
}
```

---

Built by **Dev-Ntando** | NovaSpark Bot v8.0
