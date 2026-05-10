/**
 * ⚡ NovaSpark Bot v11 — TURBO EDITION
 * Ultra-fast startup | Minimal memory | Zero-bloat boot
 * Powered by Baileys | By Dev-Ntando
 */
'use strict';

// ── Skip Puppeteer downloads ──────────────────────────────────────────────────
process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

// ── Temp system + cleanup (lightweight) ───────────────────────────────────────
const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// ── Console filter (suppress Baileys noise) ───────────────────────────────────
const orig = { log: console.log, error: console.error, warn: console.warn };
const SUPPRESS = ['sessionentry','prekey','ratchet','_chains','signal protocol','chainkey','currentratchet','registrationid','closing session','basekeypair','remoteid','pendingprekey','ephemeralkeypair','rootkey','indexinfo'];
const _suppressCheck = (a) => {
  const m = a.map(x => typeof x === 'string' ? x : (x ? JSON.stringify(x) : '')).join(' ').toLowerCase();
  for (let i = 0; i < SUPPRESS.length; i++) {
    if (m.includes(SUPPRESS[i])) return true;
  }
  return false;
};
console.log   = (...a) => { if (!_suppressCheck(a)) orig.log(...a); };
console.error = (...a) => { if (!_suppressCheck(a)) orig.error(...a); };
console.warn  = (...a) => { if (!_suppressCheck(a)) orig.warn(...a); };

const _stdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...rest) => {
  const s = typeof chunk === 'string' ? chunk : chunk.toString();
  const lower = s.toLowerCase();
  for (let i = 0; i < SUPPRESS.length; i++) {
    if (lower.includes(SUPPRESS[i])) return true;
  }
  return _stdoutWrite(chunk, ...rest);
};

// ── Core dependencies ─────────────────────────────────────────────────────────
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const qrcode  = require('qrcode-terminal');
const config  = require('./config');
const handler = require('./handler');
const trial   = require('./utils/trial');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

// ── SESSION_ID restore ────────────────────────────────────────────────────────
// If SESSION_ID env var is set (NovaSpark!<base64>), restore session files
// before Baileys tries to load them. This enables zero-touch cloud deploys.
(function restoreSessionFromEnv() {
  const sid = process.env.SESSION_ID || config.sessionID;
  if (!sid || !sid.startsWith('NovaSpark!')) return;
  const sessionDir = path.join(__dirname, config.sessionName || 'session');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  // Only restore if the directory is empty (don't overwrite a running session)
  const existing = fs.readdirSync(sessionDir).filter(f => !f.startsWith('.'));
  if (existing.length > 0) return;
  try {
    const b64  = sid.slice('NovaSpark!'.length);
    const json = Buffer.from(b64, 'base64').toString('utf-8');
    const files = JSON.parse(json);
    for (const [name, content] of Object.entries(files)) {
      const safeName = path.basename(name); // prevent path traversal
      fs.writeFileSync(path.join(sessionDir, safeName), content, 'utf-8');
    }
    orig.log('[SESSION] ✅ Session restored from SESSION_ID env var.');
  } catch (e) {
    orig.log('[SESSION] ⚠️  Failed to restore session from SESSION_ID:', e.message);
  }
})();

// ── Banner ────────────────────────────────────────────────────────────────────
function printBanner() {
  const owners = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
  orig.log(`
╔══════════════════════════════════════════════╗
  ⚡  N O V A S P A R K   v11  TURBO  ⚡
       2 0 2 6   E D I T I O N
╚══════════════════════════════════════════════╝

   📦  Version : ${config.botVersion}
   ⚡  Prefix  : ${config.prefix}
   👑  Owner   : ${owners}
   🚀  Engine  : TURBO (lazy-load + cached DB)

   ⏳ Starting up...
`);
}

function printOnline(sock) {
  const owners = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
  const botNum = sock.user.id.split(':')[0];
  const now = new Date().toLocaleString('en-ZA', {
    timeZone: config.timezone, hour12: false,
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  orig.log(`
╔══════════════════════════════════════════════╗
  ✅  N O V A S P A R K   O N L I N E !
╚══════════════════════════════════════════════╝

   🤖  Bot    : ${config.botName} v${config.botVersion}
   📱  Number : +${botNum}
   👑  Owner  : ${owners}
   🕐  Time   : ${now}
   💾  RAM    : ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
   🚀  Mode   : TURBO ENGINE

   ⚡ All systems operational!
`);
}

// ══════════════════════════════════════════════════════════════════════════════
// BOT STARTUP
// ══════════════════════════════════════════════════════════════════════════════
async function startBot() {
  printBanner();

  const sessionDir = path.join(__dirname, config.sessionName || 'session');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['NovaSpark-TURBO', 'Chrome', '120.0.0'],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: true,
    // Performance tuning
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: undefined,
    emitOwnEvents: true,
    fireInitQueries: true,
  });

  // ── Pairing-code flow (if PAIRING_NUMBER is set, skip QR) ──────────────────
  // Set PAIRING_NUMBER=263xxxxxxxxx to get a 8-digit code in the console.
  // Then enter it in WhatsApp → Linked Devices → Link with phone number.
  const pairingNumber = process.env.PAIRING_NUMBER || '';
  let _pairCodeRequested = false;

  // ── Connection events ───────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      if (pairingNumber && !_pairCodeRequested) {
        // Use pairing code instead of QR
        _pairCodeRequested = true;
        try {
          const code = await sock.requestPairingCode(pairingNumber.replace(/\D/g, ''));
          orig.log(`\n╔═══════════════════════════════════╗`);
          orig.log(`  📲  PAIRING CODE: ${code}`);
          orig.log(`  Enter this in WhatsApp → Linked`);
          orig.log(`  Devices → Link with phone number`);
          orig.log(`╚═══════════════════════════════════╝\n`);
        } catch (e) {
          orig.log('[PAIR] Failed to get pairing code:', e.message);
          orig.log('\n📱 Falling back to QR code:\n');
          qrcode.generate(qr, { small: true });
        }
      } else if (!pairingNumber) {
        orig.log('\n📱 Scan QR code to connect:\n');
        qrcode.generate(qr, { small: true });
        orig.log('\n💡 TIP: Set PAIRING_NUMBER=<your_number> to pair without QR scan.');
        orig.log('💡 TIP: Run  npm run pair  and open http://localhost:3001 for web pairing.\n');
      }
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      orig.log(`[CONN] Disconnected: ${reason || 'unknown'}`);
      if (reason !== DisconnectReason.loggedOut) {
        orig.log('[CONN] Reconnecting in 3s...');
        setTimeout(startBot, 3000);
      } else {
        orig.log('[CONN] Logged out. Delete session folder to re-pair.');
      }
    }

    if (connection === 'open') {
      printOnline(sock);
      trial.initTrial(); // Start / check trial on first connect

      // ── Seed premium numbers from config ──────────────────────────────────
      // Ensures config.premiumNumbers are always in the database premium list.
      try {
        const db = require('./database');
        const premNums = Array.isArray(config.premiumNumbers) ? config.premiumNumbers : [];
        for (const num of premNums) {
          const jid = `${num.replace(/\D/g,'')}@s.whatsapp.net`;
          if (!db.isPremium(jid)) db.addPremium(jid);
        }
      } catch {}

      // Start auto-features (lazy — loaded only when needed)
      _startAutoFeatures(sock);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Anti-Call ───────────────────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    for (const c of calls) {
      if (c.status !== 'offer') continue;
      try { await sock.rejectCall(c.id, c.from); } catch {}
    }
  });

  // ── Messages (main hot path) ────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;

      // Status broadcasts — skip (or react if configured)
      if (msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {
        try {
          const autoStatusReact = require('./commands/owner/autostatusreact');
          await autoStatusReact.onStatusUpdate({ sock, msg });
        } catch {}
        continue;
      }

      // fromMe gate
      if (msg.key.fromMe) {
        const botNum = sock.user?.id ? sock.user.id.split(':')[0].split('@')[0] : '';
        const ownerNums = (Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber])
          .map(n => String(n).replace(/\D/g, ''));
        const prefix = config.prefix || '.';
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text ||
                     msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || '';
        const isCommand = body.length > 0 && body.charCodeAt(0) === prefix.charCodeAt(0);
        const botIsOwner = ownerNums.includes(botNum.replace(/\D/g, ''));
        if (!(isCommand && botIsOwner)) continue;
        if (!msg.key.remoteJid?.endsWith('@g.us') && !msg.key.participant) {
          msg._ownerOverride = `${ownerNums[0]}@s.whatsapp.net`;
        }
      }

      // Process
      try {
        if (handler.cacheMessage) handler.cacheMessage(msg);
        await handler(sock, msg);
      } catch (e) {
        orig.error('[HANDLER ERROR]', e.message);
      }
    }
  });

  // ── Message delete (anti-delete) ────────────────────────────────────────────
  sock.ev.on('messages.delete', async (update) => {
    try { if (handler.handleDelete) await handler.handleDelete(sock, update); } catch {}
  });

  // ── Group participant events ────────────────────────────────────────────────
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const gs = require('./database').getGroupSettings(id);

      // AntiFake on join
      if (action === 'add') {
        try {
          const antifakeMod = require('./commands/group/antifake');
          for (const jid of participants) {
            await antifakeMod.checkJoin(sock, id, jid, gs);
          }
        } catch {}
      }

      // Welcome
      if (action === 'add' && gs.welcome) {
        const meta = await sock.groupMetadata(id).catch(() => null);
        const count = meta?.participants?.length || 0;
        for (const jid of participants) {
          const num = jid.split('@')[0];
          let txt = gs.welcomeMsg || `👋 Welcome to *${meta?.subject || 'the group'}*, @${num}! 🎉\nWe now have *${count}* members.`;
          txt = txt
            .replace(/@user/g, `@${num}`)
            .replace(/@group/g, meta?.subject || 'the group')
            .replace(/@count/g, String(count))
            .replace(/@date/g, new Date().toLocaleDateString('en-ZA'));
          await sock.sendMessage(id, { text: txt, mentions: [jid] });
        }
      }

      // Goodbye
      if (action === 'remove' && gs.goodbye) {
        const meta = await sock.groupMetadata(id).catch(() => null);
        for (const jid of participants) {
          const num = jid.split('@')[0];
          let txt = gs.goodbyeMsg || `👋 @${num} has left the group. Goodbye!`;
          txt = txt.replace(/@user/g, `@${num}`).replace(/@group/g, meta?.subject || 'the group');
          await sock.sendMessage(id, { text: txt, mentions: [jid] });
        }
      }
    } catch {}
  });

  return sock;
}

// ── Auto-features startup (deferred — doesn't block connection) ───────────────
function _startAutoFeatures(sock) {
  setImmediate(() => {
    try {
      const autoonline = require('./commands/owner/autoonline');
      if (autoonline.startAutoOnline) autoonline.startAutoOnline(sock);
    } catch {}
    try {
      const autobackup = require('./commands/owner/autobackup');
      if (autobackup.startAutoBackup) autobackup.startAutoBackup(sock);
    } catch {}
    try {
      const autobio = require('./commands/owner/autobio');
      if (autobio.startAutoBio) autobio.startAutoBio(sock);
    } catch {}
    try {
      const autostatusreact = require('./commands/owner/autostatusreact');
      if (autostatusreact.startAutoStatusReact) autostatusreact.startAutoStatusReact(sock);
    } catch {}
    try {
      const autogoodnight = require('./commands/group/autogoodnight');
      if (autogoodnight.startAutoGoodnight) autogoodnight.startAutoGoodnight(sock);
    } catch {}
  });
}

startBot().catch(e => { console.error('Fatal error:', e); process.exit(1); });
