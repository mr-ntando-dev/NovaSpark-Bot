# ⚡ NovaSpark Bot — Render Deployment Guide

## What was added

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint — defines the service, disk, and env vars |
| `package.json` | Added `engines` field to pin Node ≥ 20 |
| `config.js` | `sessionName` now reads `SESSION_DIR` env var so Render's persistent disk is used |

---

## Step 1 — Get your session string

Before deploying you need a valid WhatsApp session string.

1. Run the bot **locally** once (`npm install && node index.js`)
2. Scan the QR code with your WhatsApp
3. After connecting, run this one-liner to encode your session:

```bash
node -e "
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const creds = fs.readFileSync('./session/creds.json');
const compressed = zlib.gzipSync(creds);
console.log('NovaSpark!' + compressed.toString('base64'));
"
```

4. Copy the `NovaSpark!...` string — you'll paste it into Render in Step 3.

---

## Step 2 — Push your code to GitHub

```bash
git add .
git commit -m "Add Render deployment config"
git push
```

---

## Step 3 — Deploy on Render

### Option A — Render Blueprint (recommended, one-click)

1. Go to **https://dashboard.render.com/**
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo (`dev-modder/NovaSpark-Bot`)
4. Render will detect `render.yaml` and pre-fill everything
5. Review the settings and click **"Apply"**

### Option B — Manual setup

1. **New +** → **Background Worker**
2. Connect your GitHub repo
3. Set:
   - **Name:** `novaspark-bot`
   - **Build Command:** `npm install --omit=dev`
   - **Start Command:** `node index.js`
4. Under **Disks**, add:
   - **Name:** `session-data`
   - **Mount Path:** `/opt/render/project/src/session`
   - **Size:** 1 GB
5. Under **Environment Variables**, add:
   - `SESSION_ID` → your `NovaSpark!...` string
   - `SESSION_DIR` → `session` (default, no change needed)
   - `OPENAI_API_KEY` → (optional)
   - `DEEPAI_API_KEY` → (optional)
   - `PUPPETEER_SKIP_DOWNLOAD` → `true`
   - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` → `true`

---

## Step 4 — Verify it's running

In the Render **Logs** tab you should see:

```
╔══════════════════════════════════════════╗
  ✅  N O V A S P A R K  O N L I N E  !
╚══════════════════════════════════════════╝
```

---

## Important notes

- **Plan:** Use at least the **Starter** plan ($7/mo). The free plan spins down after inactivity and your WhatsApp session will disconnect.
- **Persistent disk:** The `session/` folder is mounted on a persistent disk so your login survives redeploys. Without it the bot re-authenticates on every deploy.
- **Session string:** The `SESSION_ID` env var is the safest way to pass your session. Never commit it to git.
- **WhatsApp ToS:** This bot uses the unofficial Baileys library. Use at your own risk.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Bot keeps logging out | Make sure persistent disk is attached and `SESSION_DIR=session` is set |
| `QR code` shown in logs on every start | Your `SESSION_ID` env var is missing or malformed |
| `Cannot find module` errors | Re-run build (`npm install --omit=dev`) and redeploy |
| Bot disconnects after 30 min | Expected behaviour — watchdog auto-reconnects in 5 s |
