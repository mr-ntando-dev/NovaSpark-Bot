# ⚡ NovaSpark Bot — Hosting & Deployment Guide

## Host on NovaSpark Nodes (Official — Recommended)

**NovaSpark Nodes** is the official hosting panel for NovaSpark Bot.

🌐 **Panel:** [novaspark-nodes.zone.id](https://novaspark-nodes.zone.id)

---

## Step 1 — Get your SESSION_ID

1. Go to the **NovaSpark Pairing Site**: [NovaSpark-Pairing](https://github.com/dev-modder/NovaSpark-Pairing)
2. Enter your WhatsApp number (with country code, e.g. `263786831091`)
3. Enter the 6-digit code in WhatsApp → **Linked Devices → Link with phone number**
4. Copy the `NovaSpark!...` string — you'll paste it as `SESSION_ID` in the panel.

---

## Step 2 — Deploy on NovaSpark Nodes

1. Log in at **https://novaspark-nodes.zone.id**
2. Create a new **Node.js** service
3. Connect your fork of `dev-modder/NovaSpark-Bot`
4. Set these environment variables:

| Variable | Value |
|---|---|
| `SESSION_ID` | `NovaSpark!...` (from Step 1) |
| `PREFIX` | `.` (or your preferred prefix) |
| `OWNER_NUMBER` | Your number e.g. `263786831091` |
| `BOT_NAME` | `NovaSpark Bot` |

5. Click **Deploy** — bot will be online in ~2 minutes.

---

## Step 3 — Verify

In WhatsApp, send `.menu` to the bot number. You should see the full v7 menu with 12 categories.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Bot offline / 401 error | Session expired — generate a new SESSION_ID from pairing site |
| Commands not responding | Check PREFIX env var matches what you type |
| Bot restarts in a loop | Check logs for the exact error code |

---

## Other hosting options (VPS / self-hosted)

```bash
git clone https://github.com/dev-modder/NovaSpark-Bot.git
cd NovaSpark-Bot
npm install
SESSION_ID="NovaSpark!..." node index.js
```

---
_⚡ NovaSpark Bot v7.0 — By Dev-Ntando_
