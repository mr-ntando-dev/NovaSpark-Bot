/**
 * ⚡ NovaSpark Bot v4 — 2026 EDITION
 * Main Entry Point — WhatsApp MD AutoChat Bot
 * Powered by Baileys | By Dev-Ntando
 */
'use strict';

process.env.PUPPETEER_SKIP_DOWNLOAD          = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup }         = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// ── Console filter ─────────────────────────────────────────────────────────────
const orig = { log: console.log, error: console.error, warn: console.warn };
const SUPPRESS = ['sessionentry','prekey','ratchet','_chains','signal protocol','chainkey','currentratchet','registrationid'];
const shouldHide = (...a) => {
  const m = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ').toLowerCase();
  return SUPPRESS.some(s => m.includes(s));
};
console.log   = (...a) => { if (!shouldHide(...a)) orig.log.apply(console, a); };
console.error = (...a) => { if (!shouldHide(...a)) orig.error.apply(console, a); };
console.warn  = (...a) => { if (!shouldHide(...a)) orig.warn.apply(console, a); };

const pino   = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const qrcode  = require('qrcode-terminal');
const config  = require('./config');
const handler = require('./handler');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

// ── Banner ─────────────────────────────────────────────────────────────────────
function printBanner() {
  const owners = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
  orig.log([
    '',
    '╔══════════════════════════════════════════════╗',
    '  ⚡   N O V A S P A R K   B O T   v4  ⚡',
    '       2 0 2 6  E D I T I O N',
    '╚══════════════════════════════════════════════╝',
    '',
    `   📦  Version : ${config.botVersion}`,
    `   ⚡  Prefix  : ${config.prefix}`,
    `   👑  Owner   : ${owners}`,
    '',
    '   🌙 Night Mode   ✅ | 👻 Ghost Mode  ✅',
    '   🧠 Anti-Toxic   ✅ | ⭐ VIP Mode    ✅',
    '   🎮 Wordle/Trivia ✅ | 🎵 TikTok DL  ✅',
    '   🖼️  Remove BG   ✅ | 💕 Ship Score  ✅',
    '',
    '   ⏳ Starting up...',
    '',
  ].join('\n'));
}

function printOnline(sock) {
  const owners  = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
  const botNum  = sock.user.id.split(':')[0];
  const now     = new Date().toLocaleString('en-ZA', {
    timeZone: config.timezone, hour12: false,
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  orig.log([
    '',
    '╔══════════════════════════════════════════════╗',
    '  ✅  N O V A S P A R K   O N L I N E !',
    '╚══════════════════════════════════════════════╝',
    '',
    `   🤖  Bot    : ${config.botName} v${config.botVersion}`,
    `   📱  Number : +${botNum}`,
    `   ⚡  Prefix : ${config.prefix}`,
    `   👑  Owner  : ${owners}`,
    `   🕐  Time   : ${now}`,
    '',
    '   🟢  Ready! Type .menu in WhatsApp.',
    '   🔥  Powered by Dev-Ntando | NovaSpark 2026',
    '',
  ].join('\n'));
}

// ── Connect ────────────────────────────────────────────────────────────────────
async function startBot() {
  printBanner();

  const sessionDir = path.resolve(config.sessionName);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth:   state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    // Aggressive keep-alive for stability
    keepAliveIntervalMs: 10000,
    connectTimeoutMs:    60000,
    defaultQueryTimeoutMs: 30000,
    emitOwnEvents: false,
  });

  // ── QR / Session string ──────────────────────────────────────────────────
  if (!config.sessionID || config.sessionID === '') {
    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) {
        orig.log('\n📱 Scan this QR code to connect:\n');
        qrcode.generate(qr, { small: true });
      }
    });
  } else {
    // Session string provided — decode and save
    const sessionPath = path.join(sessionDir, 'creds.json');
    if (!fs.existsSync(sessionPath)) {
      try {
        const zlib = require('zlib');
        const b64  = config.sessionID.replace(/^NovaSpark!/, '').replace(/^KnightBot!/, '');
        const buf  = Buffer.from(b64, 'base64');
        const decompressed = zlib.gunzipSync(buf).toString('utf-8');
        fs.writeFileSync(sessionPath, decompressed);
        orig.log('✅ Session loaded from SESSION_ID.');
      } catch (e) {
        orig.log('⚠️  Could not decode SESSION_ID. Falling back to QR scan.');
      }
    }
  }

  // ── Connection events ─────────────────────────────────────────────────────
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      printOnline(sock);
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      orig.log(`\n🔴 Disconnected (code ${code}). ${shouldReconnect ? 'Reconnecting in 5s...' : 'Logged out.'}`);
      if (shouldReconnect) setTimeout(startBot, 5000);
    }
  });

  // ── Creds save ────────────────────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ── Messages ──────────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      try {
        // Cache for antidelete
        if (handler.cacheMessage) handler.cacheMessage(msg);
        await handler(sock, msg);
      } catch (e) {
        orig.error('[HANDLER ERROR]', e.message);
      }
    }
  });

  // ── Message delete ────────────────────────────────────────────────────────
  sock.ev.on('messages.delete', async (update) => {
    try {
      if (handler.handleDelete) await handler.handleDelete(sock, update);
    } catch {}
  });

  // ── Group participant events ──────────────────────────────────────────────
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const gs = require('./database').getGroupSettings(id);

      if (action === 'add' && gs.welcome) {
        const meta = await sock.groupMetadata(id).catch(() => null);
        const count = meta?.participants?.length || 0;
        for (const jid of participants) {
          const num = jid.split('@')[0];
          let txt = gs.welcomeMsg || `👋 Welcome to *${meta?.subject || 'the group'}*, @${num}! 🎉\nWe now have *${count}* members.`;
          txt = txt
            .replace(/@user/g, `@${num}`)
            .replace(/@group/g, meta?.subject || 'the group')
            .replace(/@count/g, count)
            .replace(/@date/g, new Date().toLocaleDateString('en-ZA'));
          await sock.sendMessage(id, { text: txt, mentions: [jid] });
        }
      }

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

startBot().catch(e => { console.error('Fatal error:', e); process.exit(1); });
