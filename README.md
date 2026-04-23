<div align="center">

# ⚡ NovaSpark Bot v4 — 2026 Edition

**The most advanced WhatsApp MD bot ever built.**

*By Dev-Ntando | Powered by [Baileys](https://github.com/WhiskeySockets/Baileys)*

[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-7.x-blue)](https://github.com/WhiskeySockets/Baileys)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-4.0.0-red)](package.json)

</div>

---

## ✨ What's New in v4 (Never Seen Before)

| Feature | What it does |
|---------|-------------|
| 👻 `.ghost on/off` | **Ghost Mode** — Bot acts totally invisible. No typing indicators, no read receipts. Still processes all commands silently. |
| 🧠 `.antitoxic on/off` | **AI Anti-Toxic Filter** — Heuristic AI scans every message for hate speech & threats. Deletes and auto-warns. No API key needed. |
| 🌙 `.nightmode on [22:00] [06:00]` | **Night Mode** — Auto-mutes group at your set time and unmutes at wake time. Runs on a background scheduler. |
| ⭐ `.vip on/off` | **VIP Mode** — Only VIP members (+ admins) can send messages. Comes with `.vip add/remove/list`. |
| 😄 `.autoreact on [random/mood]` | **Auto React** — Bot reacts to messages with emojis. Mood mode matches sentiment. Completely unique. |
| 🟩 `.wordle` | **Wordle in WhatsApp** — Full 5-letter word guessing game with colour-coded feedback. Per-user sessions. |
| 🧠 `.trivia` | **Live Trivia** — Fetches real questions from Open Trivia DB. Score tracked in your profile. |
| 🪢 `.hangman` | **Hangman game** — Classic hangman with ASCII art stages. |
| 🪨 `.rps rock/paper/scissors` | **RPS with score tracking** — Win/loss/tie record per user. |
| 🖼️ `.removebg` | **AI Background Remover** — Reply to any image. AI removes background instantly. |
| 🎵 `.tiktok <url>` | **TikTok Downloader** — Downloads TikTok videos without watermark. |
| ▶️ `.yt <query>` | **YouTube Search** — Top result with thumbnail, views, duration. |
| ✍️ `.textart <style> <text>` | **Fancy Text Art** — 7 Unicode styles: bold, italic, bubble, square, flip, mirror, tiny. |
| 💕 `.ship @user1 @user2` | **Compatibility Score** — Love compatibility calculator with emoji bar. Deterministic & shareable. |
| 🤔 `.truth` / `.dare` | **Truth or Dare** — 10 curated truths and dares. |
| 🌸 `.compliment [@user]` | **AI Compliment** — Tags someone with a genuine compliment. |
| 😈 `.insult [@user]` | **Savage Roast** — Funny (not cruel) roasts. |
| 📊 `.groupstats` | **Group Analytics Dashboard** — Top chatters, message counts, command usage, all active features. |
| 🔢 `.calc <expr>` | **Scientific Calculator** — sin, cos, sqrt, log, pi, ^ — all supported. |
| 🕐 `.time [tz]` | **World Clock** — Shows 10 major cities or any custom timezone. |
| 💪 `.motivate [@user]` | **Live Motivation** — Real quotes from quotable.io. Tag a friend with it. |
| 🪪 `.profile [@user]` | **Profile Card** — Stats, plan, game scores, join date, all in one. |
| 👋 `.welcome on/off [msg]` | **Custom Welcome Messages** — Supports `@user`, `@group`, `@count`, `@date` variables. |
| 🔤 `.antiword on/off/add/remove` | **Per-Group Bad Word Filter** — Custom word list per group. |
| ⚙️ `.setwarnlimit N` | **Configurable Warn Limit** — Set auto-kick threshold per group. |

---

## 🆓 Free Plan Commands

| Command | Description |
|---------|-------------|
| `.menu [group/ai/games/media/social/tools]` | Categorized command menu |
| `.homework <question>` | Detailed AI answer |
| `.essay <topic>` | Full structured essay |
| `.summarize <text>` | Bullet summary |
| `.translate <lang> <text>` | Translate anything |
| `.studytips <subject>` | AI study tips |
| `.math <problem>` | Step-by-step math |
| `.sticker` | Reply to image/video → sticker |
| `.imagine <prompt>` | Free AI image generation |
| `.tts [lang] <text>` | Real voice note |
| `.news [topic]` | Live headlines |
| `.qr <text>` | QR code generator |
| `.currency 100 USD ZAR` | Real-time exchange |
| `.poll Q | A | B | C` | Native WhatsApp poll |
| `.fact` | Verified random fact |
| `.urban <word>` | Urban Dictionary |
| `.bmi <kg> <cm>` | BMI calculator |
| `.groupinfo` | Group analytics |
| `.roast @user` | AI roast |
| `.weather <city>` | 3-day weather forecast 🆕 |
| `.calc <expr>` | Scientific calculator 🆕 |
| `.time [tz]` | World clock 🆕 |
| `.wordle` | Wordle game 🆕 |
| `.trivia` | Live trivia 🆕 |
| `.hangman` | Hangman 🆕 |
| `.rps rock` | Rock Paper Scissors 🆕 |
| `.tiktok <url>` | TikTok downloader 🆕 |
| `.yt <query>` | YouTube search 🆕 |
| `.removebg` | Remove image background 🆕 |
| `.textart <style> <text>` | Fancy text styles 🆕 |
| `.ship @u1 @u2` | Love compatibility 🆕 |
| `.truth` / `.dare` | Truth or Dare 🆕 |
| `.compliment [@user]` | Compliment 🆕 |
| `.insult [@user]` | Savage roast 🆕 |
| `.motivate [@user]` | Live motivation 🆕 |
| `.profile [@user]` | Profile card 🆕 |

## 💎 Premium Plan Commands

| Command | Description |
|---------|-------------|
| `.examprep <subject>` | Full exam revision |
| `.code <lang> <task>` | Generate working code |
| `.remind <time> <msg>` | Real reminders |
| `.mystats` | Personal analytics |
| `.autostudy on <subject>` | Daily study tips |
| `.setpersona <desc>` | Custom AI persona |

## 🛡️ Group Admin Commands

| Command | Description |
|---------|-------------|
| `.warn @user [reason]` | Warn member |
| `.warns @user` | Check warns |
| `.clearwarn @user` | Clear warns |
| `.setwarnlimit N` | Set warn limit 🆕 |
| `.kick @user` | Remove member 🆕 |
| `.promote @user` | Make admin 🆕 |
| `.demote @user` | Remove admin 🆕 |
| `.mute / .unmute` | Lock/unlock group 🆕 |
| `.tagall [msg]` | Tag all members 🆕 |
| `.antilink on/off` | Block links |
| `.antiword on/off/add/remove` | Bad word filter 🆕 |
| `.antitoxic on/off` | AI toxic filter 🆕 |
| `.nightmode on/off` | Night schedule 🆕 |
| `.vip on/off/add/remove/list` | VIP mode 🆕 |
| `.ghost on/off` | Ghost mode 🆕 |
| `.autoreact on/off` | Auto-react 🆕 |
| `.welcome on/off [msg]` | Welcome messages 🆕 |
| `.goodbye on/off [msg]` | Goodbye messages 🆕 |
| `.groupstats` | Analytics dashboard 🆕 |

## 👑 Owner Commands

| Command | Description |
|---------|-------------|
| `.setpremium add/remove/list @user` | Manage premium |
| `.antidelete on/off` | Catch deleted messages |
| `.botstats` | Full server stats |

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

### 3. Configure `config.js`

```js
ownerNumber: ['YOUR_NUMBER'],   // without +
ownerName:   ['Your Name'],
botName:     'NovaSpark Bot',
prefix:      '.',
sessionID:   'NovaSpark!...',   // or leave '' to scan QR
```

### 4. Run

```bash
node index.js
```

### 5. Deploy on NovaSpark Nodes (Official Hosting)

Set env vars:
- `SESSION_ID` — your session string
- `OPENAI_API_KEY` — optional (improves AI quality)
- `REMOVE_BG_API_KEY` — optional (remove.bg for background removal)

---

## ⚙️ Configuration Keys

| Key | Description |
|-----|-------------|
| `ownerNumber` | Your number(s) without `+` |
| `ownerName` | Your name(s) |
| `botName` | Display name |
| `prefix` | Command prefix (default `.`) |
| `sessionID` | Session string |
| `channelLink` | Your WhatsApp channel link |
| `rateLimitPerMinute` | Commands per minute before throttle |

---

## ⚠️ Warning

- For educational / personal use only
- **NOT** an official WhatsApp product
- May violate WhatsApp ToS — use at your own risk

---

## 📄 License

MIT © 2026 Dev-Ntando

---

<div align="center">

**⚡ Built different. Runs different. NovaSpark v4 — 2026.**

</div>
