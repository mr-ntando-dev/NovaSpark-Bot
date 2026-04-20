# ⚡ NovaSpark Bot v3 — WhatsApp MD AutoChat Bot

**By Dev-Ntando** | Powered by [Baileys](https://github.com/WhiskeySockets/Baileys)

[![Node](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-latest-blue)](https://github.com/WhiskeySockets/Baileys)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ✨ What is NovaSpark Bot v3?

NovaSpark Bot is a feature-packed WhatsApp MD bot built on Baileys. Version 3 is a **complete upgrade** — every feature is real and works exactly as advertised. No fake poll images. No placeholder voice notes. Everything fires live.

**Two tiers:**
- 🆓 **Free Plan** — powerful tools for everyone
- 💎 **Premium Plan** — advanced features for power users

---

## 🚀 What's New in v3

| Feature | What it does |
|---|---|
| 🖼️ `.sticker` | Converts images & videos to real WhatsApp stickers (sharp + WebP) |
| 📰 `.news [topic]` | Live headlines from BBC RSS — world, tech, sports, africa, zim |
| 📲 `.qr <text>` | Generates & sends a scannable QR code as an image |
| 🎨 `.imagine <prompt>` | FREE AI image generation via Pollinations (no key needed) |
| 🎙️ `.tts [lang] <text>` | Real voice notes via Google TTS — en, fr, sw, zu, sn, ar, hi & more |
| 💱 `.currency 100 USD ZAR` | Real-time exchange rates (150+ currencies, zero API key) |
| 📊 `.poll Q \| A \| B \| C` | Native WhatsApp polls (not fake text polls) |
| 🧠 `.fact` | Random verified interesting facts from live API |
| 📖 `.urban <word>` | Urban Dictionary slang lookup with vote counts |
| ⚖️ `.bmi <kg> <cm>` | BMI calculator + personalised health advice |
| 👥 `.groupinfo` | Rich group analytics — members, admins, age, settings |
| 🔥 `.roast @user` | AI-generated personalised roast (funny, not cruel) |
| 🛡️ `.antidelete on/off` | Catches deleted messages, forwards to owner DM |
| ⚠️ `.warn @user` | Warning system with auto-kick at 3 warnings |
| 💾 Persistent Memory | AI conversation memory survives bot restarts (file-backed) |
| ✅ Auto cache | Every message auto-cached for antidelete |

---

## 🆓 Free Plan Features

| Command | Description |
|---|---|
| `.math <problem>` | Solve any math with full step-by-step working |
| `.weather <city>` | Real-time weather for any city |
| `.homework <question>` | Detailed AI answer |
| `.essay <topic>` | Full structured essay |
| `.summarize <text>` | Bullet-point summary |
| `.translate <lang> <text>` | Translate to any language |
| `.studytips <subject>` | AI-powered study tips |
| `.pdf <title> \| <subject>` | Generate a school project PDF |
| `.sticker` | Reply to image/video to make a real sticker |
| `.news [topic]` | Live headlines (world · tech · sports · africa · zim) |
| `.qr <text>` | Generate a scannable QR code |
| `.imagine <prompt>` | AI image generation — FREE, no API key |
| `.tts [lang] <text>` | Text to real voice note audio |
| `.currency <amt> <from> <to>` | Real-time currency conversion |
| `.poll <Q> \| A \| B \| C` | Native WhatsApp poll (up to 12 options) |
| `.fact` | Verified random interesting fact |
| `.urban <word>` | Urban Dictionary slang lookup |
| `.bmi <kg> <cm>` | BMI + personalised health advice |
| `.groupinfo` | Group analytics (groups only) |
| `.roast @user` | AI-generated personalised roast |
| `.myplan` | Full command menu + plan status |
| `.autochat off/on` | Mute / unmute bot in this chat |
| `.autochat reset` | Clear conversation memory |
| `.autochat persona <name>` | friendly · professional · savage · tutor · motivator |

---

## 💎 Premium Plan Features

| Command | Description |
|---|---|
| `.examprep <subject>` | Full exam revision notes |
| `.code <language> <task>` | Generate working code in any language |
| `.remind <time> <msg>` | Set real reminders (30s, 5m, 2h, 1d) |
| `.mystats` | Personal usage analytics dashboard |
| `.autostudy on <subject>` | Auto daily study tips |
| `.setpersona <description>` | Fully custom AI persona |
| All Free features | Everything above, with priority AI |

---

## 👑 Owner Commands

| Command | Description |
|---|---|
| `.setpremium add @user` | Grant Premium |
| `.setpremium remove @user` | Revoke Premium |
| `.setpremium list` | List all Premium users |
| `.antidelete on/off` | Catch deleted messages → forward to your DM |
| `.warn @user [reason]` | Warn a user (auto-kicks at 3 warnings) |
| `.warns @user` | Check a user's warning count |
| `.clearwarn @user` | Reset all warnings for a user |
| `.botstats` | Bot usage & server info |

---

## 🚀 Setup

### 1. Clone the repo
```bash
git clone https://github.com/dev-modder/NovaSpark-Bot.git
cd NovaSpark-Bot
```

### 2. Install dependencies
```bash
npm install
```

> **Note:** `sharp` requires a C++ build environment. On most servers/VPS this is pre-installed. On Render, it works out of the box.

### 3. Add your session string

Edit `config.js`:
```js
sessionID: 'NovaSpark!H4....'
```
Or set `SESSION_ID` as an environment variable.

### 4. Run
```bash
node index.js
```

### 5. Deploy on Render / Heroku / VPS

Set environment variables:
- `SESSION_ID` — your session string
- `OPENAI_API_KEY` — optional, improves AI quality
- `DEEPAI_API_KEY` — optional

---

## ⚙️ Configuration (`config.js`)

| Key | Description |
|---|---|
| `ownerNumber` | Your number(s) without `+` |
| `ownerName` | Your name(s) |
| `botName` | Display name |
| `prefix` | Command prefix (default `.`) |
| `sessionID` | Session string |

---

## ⚠️ Warning

- Educational / personal use only
- **NOT** an official WhatsApp product
- May violate WhatsApp ToS — use at your own risk

---

## 📄 License

MIT © 2026 Dev-Ntando
