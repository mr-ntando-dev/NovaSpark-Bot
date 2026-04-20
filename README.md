<div align="center">

# ⚡ NovaSpark Bot

**WhatsApp MD Bot — AutoChat AI + Free & Premium Features**

*By Dev-Ntando*

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-7.x-blue)](https://github.com/WhiskeySockets/Baileys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## ✨ What is NovaSpark Bot?

NovaSpark Bot is a smart WhatsApp MD bot built on Baileys with two tiers of features:
- **🆓 Free Plan** — powerful AI tools available to everyone
- **💎 Premium Plan** — advanced features unlocked by the owner

---

## 👤 Registration

The first time you turn on AutoChat, the bot will guide you through a quick registration:
1. **Full Name**
2. **Age**
3. **School / Institution**
4. **Email Address**

This personalizes all AI responses and puts your name on generated PDFs.

---

## 🆓 Free Plan Features

| Command | Description |
|---|---|
| `.autochat on/off` | Enable/disable AutoChat AI in this chat |
| `.autochat reset` | Clear conversation memory |
| `.autochat status` | Show current settings and stats |
| `.autochat persona <name>` | Switch personality: friendly, professional, savage, tutor, motivator |
| `.autochat delay <ms>` | Set reply delay (300–8000ms) |
| `.autochat imggen on\|off` | Toggle auto image generation |
| `.autochat analyze on\|off` | Toggle auto image analysis |
| `.autochat ocr on\|off` | Toggle OCR (read text from images) |
| `.homework <question>` | Detailed AI answer to any homework question |
| `.essay <topic>` | Full structured essay on any topic |
| `.summarize <text>` | Summarize any text (or reply to a message) |
| `.translate <lang> <text>` | Translate to any language |
| `.studytips <subject>` | AI-powered study tips for any subject |
| `.pdf <title> \| <subject>` | Generate a school project PDF |
| `.myplan` | Check your plan and see Premium features |

---

## 💎 Premium Plan Features

| Command | Description |
|---|---|
| `.examprep <subject>` | Full exam revision notes — topics, definitions, Q&A, memory tips |
| `.code <language> <task>` | Generate working code in any language |
| `.math <problem>` | Solve math problems with full step-by-step working |
| `.remind <time> <msg>` | Set reminders (30s, 5m, 2h, 1d) |
| `.mystats` | View your personal usage analytics dashboard |
| `.autostudy on <subject>` | Auto-send daily study tips on a schedule |
| `.setpersona <description>` | Create a fully custom AI persona |
| All Free features | Everything in Free, with priority AI |

---

## 👑 Owner Commands

| Command | Description |
|---|---|
| `.setpremium add @user` | Grant Premium to a user |
| `.setpremium remove @user` | Revoke Premium |
| `.setpremium list` | List all Premium users |
| `.botstats` | Bot usage stats and server info |

---

## 🚀 Setup

### 1. Fork this repo

### 2. Get your session string

Use a pair-code generator. You will get a string starting with `NovaSpark!...` — paste it into `config.js`:

```js
sessionID: 'NovaSpark!H4....'
```

Or set `SESSION_ID` as an environment variable.

### 3. Run locally

```bash
git clone https://github.com/dev-modder/NovaSpark-Bot.git
cd NovaSpark-Bot
npm install
node index.js
```

### 4. Deploy on Panel / Heroku / VPS

Set env vars:
- `SESSION_ID` — your session string
- `OPENAI_API_KEY` — optional, improves AI quality
- `DEEPAI_API_KEY` — optional, for image generation

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

- Educational purposes only
- **NOT** an official WhatsApp product
- May violate WhatsApp ToS — use at your own risk

---

## 📄 License

MIT © 2026 Dev-Ntando
