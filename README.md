<div align="center">

# ⚡ NovaSpark Bot

**A lightning-fast WhatsApp MD AutoChat Bot built on [Baileys](https://github.com/WhiskeySockets/Baileys)**

*By Dev-Ntando*

</div>

---

## ✨ What is NovaSpark Bot?

NovaSpark Bot is a lean, focused WhatsApp MD bot with one purpose: **AutoChat** — a powerful AI-powered auto-reply system that brings your WhatsApp chats to life. No bloat. No unused commands. Just AutoChat, done right.

---

## 🤖 AutoChat Commands

| Command | Description |
|---|---|
| `.autochat on` | Enable AutoChat in this chat |
| `.autochat off` | Disable AutoChat |
| `.autochat reset` | Clear conversation memory |
| `.autochat status` | Show current state & stats |
| `.autochat persona <name>` | Switch AI personality |
| `.autochat delay <ms>` | Set reply delay (300–8000ms) |
| `.autochat imggen on\|off` | Toggle auto image generation |
| `.autochat analyze on\|off` | Toggle auto image analysis |
| `.autochat ocr on\|off` | Toggle auto OCR on images |

**Auto-features (when AutoChat is enabled):**
- Text → AI chat reply with memory & persona
- "draw/generate/create image of X" → generates & sends an image
- Image received → AI describes/analyzes it
- Image with text → OCR extracts + AI comments
- Sticker/audio → natural acknowledgement

---

## 🚀 Setup

### 1. Fork this repo

> This creates your own copy of `NovaSpark-Bot` under your GitHub account.

### 2. Get a Pair Code / Session String

Deploy the pair-code helper and generate your session string.

After scanning, you will receive a session string. Paste it into `config.js`:

```js
sessionID: 'NovaSpark!H4....'
```

Or set it as an environment variable:

```
SESSION_ID=NovaSpark!H4....
```

### 3. Deploy (Panel / VPS / Heroku)

#### Local

```bash
git clone https://github.com/dev-modder/NovaSpark-Bot.git
cd NovaSpark-Bot
npm install
node index.js
```

- If `sessionID` is empty → scan the QR code in terminal (Linked Devices in WhatsApp)
- If `sessionID` is set → bot logs in automatically

---

## ⚙️ Configuration

Edit `config.js` to set:

| Key | Description |
|---|---|
| `ownerNumber` | Your WhatsApp number(s) without `+` |
| `ownerName` | Your name(s) |
| `botName` | Bot display name |
| `prefix` | Command prefix (default `.`) |
| `sessionID` | Session string |

---

## 📦 Dependencies

- [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web API
- `axios` — HTTP client for AI API calls
- `pino` — Logger
- `qrcode-terminal` — QR code display

---

## ⚠️ Important Warning

- This bot is for **educational purposes only**.
- This is **NOT** an official WhatsApp bot.
- Using third-party bots **may violate WhatsApp's Terms of Service** and can result in your account being **banned**.
- You use this bot **at your own risk**.

---

## 📄 License (MIT)

Copyright (c) 2026 Dev-Ntando. See [LICENSE](LICENSE).

This project is **not affiliated with, authorized, maintained, sponsored, or endorsed** by WhatsApp Inc. or any of its affiliates.
