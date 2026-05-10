# ⚡ NovaSpark Bot v11 — Hosting & Deployment Guide

---

## 🌐 Option 1 — Web Pairing (Recommended, 100% FREE)

No QR scan. No third-party pairing site. Built right into the bot.

**Step 1:** Clone and install

```bash
git clone https://github.com/mr-ntando-dev/NovaSpark-Bot.git
cd NovaSpark-Bot
npm install
npm run pair   # starts the web pairing server on port 3001
```

**Step 2:** Open http://localhost:3001 in your browser

**Step 3:** Enter your WhatsApp number (with country code, no + or spaces)

**Step 4:** Approve the 8-digit code in WhatsApp → Linked Devices → Link with phone number

**Step 5:** Copy the SESSION_ID shown on the page — you'll need it for cloud deploy

---

## 📲 Option 2 — Console Pairing Code (no browser needed)

```bash
PAIRING_NUMBER=263786831091 node index.js
```

The bot prints an 8-digit code in the terminal.
Enter it in WhatsApp → Linked Devices → Link with phone number.

---

## 📷 Option 3 — QR Code (classic)

```bash
node index.js
```

Scan the QR code that appears in the terminal with WhatsApp.

---

## 🚀 Deploy on Render (Free Tier)

1. Fork this repo
2. Go to render.com → New → Web Service
3. Connect your fork
4. Build command: `npm install`
5. Start command: `node index.js`

Set these Environment Variables:

| Variable | Value |
|---|---|
| SESSION_ID | NovaSpark!... (from pairing step above) |
| PREFIX | . |
| OWNER_NUMBER | e.g. 263786831091 |
| BOT_NAME | NovaSpark Bot |

---

## 🐳 Docker

```bash
docker build -t novaspark-bot .
docker run -d -e SESSION_ID="NovaSpark!..." -e OWNER_NUMBER="263786831091" --name novaspark novaspark-bot
```

---

## 🛠️ Troubleshooting

| Issue | Fix |
|---|---|
| Bot offline / 401 | Session expired — run npm run pair for a new SESSION_ID |
| Commands not working | Check PREFIX env var (default: .) |
| Web pairing not loading | Port 3001 must be free, or set PAIR_PORT env var |
| QR not showing | Delete session/ folder and restart |

---

*NovaSpark Bot v11.0.0 — By Dev-Ntando*
