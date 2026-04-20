# ⚡ NovaSpark Bot — Render Deployment Guide

> **Admin Panel:** `https://your-service.onrender.com`  
> **Username:** `novaspark`  
> **Password:** `ntando`

---

## 🚀 One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 📋 Manual Deploy Steps

### 1. Fork / Push to GitHub

Make sure this repo is on your GitHub account (public or private).

### 2. Create a new Render Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` and pre-fills settings

### 3. Set Required Environment Variables

In the Render dashboard → **Environment**, add:

| Variable | Value | Notes |
|---|---|---|
| `SESSION_ID` | Your Baileys session string | **Required** |
| `ADMIN_USERNAME` | `novaspark` | Can change |
| `ADMIN_PASSWORD` | `ntando` | Can change |
| `OPENAI_API_KEY` | `sk-...` | Optional |
| `DEEPAI_API_KEY` | `...` | Optional |

### 4. Deploy

Click **Create Web Service**. Render will:
- Run `npm install`
- Start `node server.js` (boots Admin Panel + WhatsApp bot)
- Mount persistent disk at `/opt/render/project/src/session`

### 5. Access Admin Panel

Once deployed, your Admin Panel is at:

```
https://<your-service-name>.onrender.com
```

Login: **novaspark / ntando**

---

## 🔐 Getting Your SESSION_ID

Run the bot locally once to generate a session:

```bash
git clone https://github.com/dev-modder/NovaSpark-Bot.git
cd NovaSpark-Bot
npm install
node index.js
```

Scan the QR code with WhatsApp. Copy the SESSION_ID from config.js/console and paste it into Render's environment variables.

---

## 💡 Notes

- Use `starter` plan ($7/mo) so the bot stays online 24/7.
- Persistent disk keeps your WhatsApp session alive across restarts.
- Admin Panel auto-refreshes stats every 30 seconds.
