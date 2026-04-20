/**
 * ⚡ NovaSpark Bot — Main Entry Point
 * WhatsApp MD Bot | AutoChat Edition
 * By Dev-Ntando
 */

'use strict';

// ── Disable Puppeteer before anything loads ───────────────────────────────────
process.env.PUPPETEER_SKIP_DOWNLOAD          = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR              =
  process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

// ── Init temp & cleanup systems ───────────────────────────────────────────────
const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup, cleanupOldFiles } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// ── Console noise filter — suppress Baileys internals ────────────────────────
const originalConsoleLog   = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn  = console.warn;

const FORBIDDEN_PATTERNS = [
  'closing session', 'closing open session', 'sessionentry',
  'prekey bundle', 'pendingprekey', '_chains', 'registrationid',
  'currentratchet', 'chainkey', 'ratchet', 'signal protocol',
  'ephemeralkeypair', 'indexinfo', 'basekey', 'ratchetkey',
];

const shouldSuppress = (...args) => {
  const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ').toLowerCase();
  return FORBIDDEN_PATTERNS.some(p => msg.includes(p));
};

console.log   = (...args) => { if (!shouldSuppress(...args)) originalConsoleLog.apply(console, args); };
console.error = (...args) => { if (!shouldSuppress(...args)) originalConsoleError.apply(console, args); };
console.warn  = (...args) => { if (!shouldSuppress(...args)) originalConsoleWarn.apply(console, args); };

// ── Dependencies ──────────────────────────────────────────────────────────────
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
const fs      = require('fs');
const path    = require('path');
const zlib    = require('zlib');
const os      = require('os');

// ── Startup banner ────────────────────────────────────────────────────────────
function printBanner() {
  const owners = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
  originalConsoleLog([
    '',
    '╔══════════════════════════════════════════╗',
    '  ⚡  N O V A S P A R K  B O T  ⚡',
    '  🤖  AutoChat Edition — WhatsApp MD',
    '╚══════════════════════════════════════════╝',
    '',
    `   📦  Bot    : ${config.botName}`,
    `   🏷️  Ver    : 1.0.0`,
    `   ⚡  Prefix : ${config.prefix}`,
    `   👑  Owner  : ${owners}`,
    '',
    '   ⏳  Starting up — please wait...',
    '',
  ].join('\n'));
}

// ── Connected banner ──────────────────────────────────────────────────────────
function printConnectedBanner(sock) {
  const owners    = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
  const botNumber = sock.user.id.split(':')[0];
  const now       = new Date().toLocaleString('en-ZA', {
    timeZone: 'Africa/Harare', hour12: false,
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  originalConsoleLog([
    '',
    '╔══════════════════════════════════════════╗',
    '  ✅  N O V A S P A R K  O N L I N E  !',
    '╚══════════════════════════════════════════╝',
    '',
    `   🤖  Bot    : ${config.botName}`,
    `   📱  Number : +${botNumber}`,
    `   ⚡  Prefix : ${config.prefix}`,
    `   👑  Owner  : ${owners}`,
    `   🕐  Time   : ${now}`,
    '',
    '   🟢  Ready — AutoChat is standing by!',
    '   🔥  Powered by Dev-Ntando',
    '',
    '╰────────────────────────────────────────╯',
    '',
  ].join('\n'));
}

// ── Puppeteer cache remover ───────────────────────────────────────────────────
function cleanupPuppeteerCache() {
  try {
    const cacheDir = path.join(os.homedir(), '.cache', 'puppeteer');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  } catch { /* ignore */ }
}

// ── In-memory message store ───────────────────────────────────────────────────
const store = {
  messages:   new Map(),
  maxPerChat: 20,
  bind(ev) {
    ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key?.id) continue;
        const jid = msg.key.remoteJid;
        if (!store.messages.has(jid)) store.messages.set(jid, new Map());
        const chatMsgs = store.messages.get(jid);
        chatMsgs.set(msg.key.id, msg);
        if (chatMsgs.size > store.maxPerChat) chatMsgs.delete(chatMsgs.keys().next().value);
      }
    });
  },
  loadMessage: async (jid, id) => store.messages.get(jid)?.get(id) || null,
};

// ── Message deduplication ─────────────────────────────────────────────────────
const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

// ── Suppressed Pino logger ────────────────────────────────────────────────────
function createLogger() {
  try {
    return pino({ level: 'silent' });
  } catch {
    return { info: () => {}, debug: () => {}, warn: () => {}, error: () => {}, trace: () => {} };
  }
}

// ── JID filter ────────────────────────────────────────────────────────────────
const isSystemJid = (jid) =>
  !jid ||
  jid.includes('@broadcast') ||
  jid.includes('status.broadcast') ||
  jid.includes('@newsletter');

// ── Main bot function ─────────────────────────────────────────────────────────
async function startBot() {
  const sessionFolder = `./${config.sessionName}`;
  const sessionFile   = path.join(sessionFolder, 'creds.json');

  // Decode session from NovaSpark! format
  if (config.sessionID && config.sessionID.startsWith('NovaSpark!')) {
    try {
      const b64data = config.sessionID.split('!')[1];
      if (!b64data) throw new Error('Missing session payload');
      const compressed   = Buffer.from(b64data, 'base64');
      const decompressed = zlib.gunzipSync(compressed);
      if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
      fs.writeFileSync(sessionFile, decompressed, 'utf8');
      console.log('📡 Session : 🔑 Restored from NovaSpark session string');
    } catch (e) {
      console.error('📡 Session : ❌', e.message);
    }
  }

  // Also support legacy KnightBot! session strings
  if (config.sessionID && config.sessionID.startsWith('KnightBot!')) {
    try {
      const b64data = config.sessionID.split('!')[1];
      if (!b64data) throw new Error('Missing session payload');
      const compressed   = Buffer.from(b64data, 'base64');
      const decompressed = zlib.gunzipSync(compressed);
      if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
      fs.writeFileSync(sessionFile, decompressed, 'utf8');
      console.log('📡 Session : 🔑 Restored (KnightBot legacy)');
    } catch (e) {
      console.error('📡 Session : ❌', e.message);
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger:              createLogger(),
    printQRInTerminal:   false,
    browser:             ['Chrome', 'Windows', '10.0'],
    auth:                state,
    syncFullHistory:     false,
    downloadHistory:     false,
    markOnlineOnConnect: false,
    getMessage:          async () => undefined,
  });

  store.bind(sock.ev);

  // ── Watchdog (reconnect after 30min inactivity) ───────────────────────────
  let lastActivity = Date.now();
  sock.ev.on('messages.upsert', () => { lastActivity = Date.now(); });

  const watchdog = setInterval(async () => {
    if (Date.now() - lastActivity > 30 * 60 * 1000 && sock.ws?.readyState === 1) {
      console.log('⚠️  30min inactivity — reconnecting...');
      await sock.end(undefined, undefined, { reason: 'inactive' });
      clearInterval(watchdog);
      setTimeout(startBot, 5000);
    }
  }, 5 * 60 * 1000);

  // ── Connection events ─────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'open')  lastActivity = Date.now();
    if (connection === 'close') clearInterval(watchdog);

    if (qr) {
      console.log('\n📱 Scan this QR code with WhatsApp:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const code    = lastDisconnect?.error?.output?.statusCode;
      const msg     = lastDisconnect?.error?.message || 'Unknown error';
      const reconnect = code !== DisconnectReason.loggedOut;
      console.log(`❌ Disconnected: ${msg} (${code}) | reconnect=${reconnect}`);
      if (reconnect) setTimeout(startBot, 5000);
      else { console.log('🚪 Logged out.'); process.exit(0); }
    }

    if (connection === 'open') {
      printConnectedBanner(sock);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Incoming messages ─────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || !msg.key?.id) continue;

      const from = msg.key.remoteJid;
      if (!from || isSystemJid(from)) continue;

      const msgId = msg.key.id;
      if (processedMessages.has(msgId)) continue;

      // Drop messages older than 5 minutes
      if (msg.messageTimestamp && Date.now() - msg.messageTimestamp * 1000 > 5 * 60 * 1000) continue;

      processedMessages.add(msgId);

      // Cache message
      if (!store.messages.has(from)) store.messages.set(from, new Map());
      const chatMsgs = store.messages.get(from);
      chatMsgs.set(msgId, msg);
      if (chatMsgs.size > store.maxPerChat) {
        const sorted = Array.from(chatMsgs.entries()).sort((a, b) =>
          (a[1].messageTimestamp || 0) - (b[1].messageTimestamp || 0));
        sorted.slice(0, sorted.length - store.maxPerChat).forEach(([k]) => chatMsgs.delete(k));
      }

      // Handle message (non-blocking)
      handler.handleMessage(sock, msg).catch(err => {
        if (!err.message?.includes('rate-overlimit') && !err.message?.includes('not-authorized')) {
          console.error('❌ Message error:', err.message);
        }
      });
    }
  });

  // ── Anti-delete: catch message-delete events ─────────────────────────────
  const antideleteCmd = require('./commands/owner/antidelete');
  sock.ev.on('messages.update', (updates) => {
    const deletes = updates.filter(u => u.update?.messageStubType === 1 || u.update?.revoke);
    if (deletes.length) {
      antideleteCmd.handleDelete(sock, { keys: deletes.map(d => d.key) }).catch(() => {});
    }
  });

  // ── Swallow non-critical events ───────────────────────────────────────────
  sock.ev.on('message-receipt.update', () => {});
  sock.ev.on('error', (err) => {
    const code = err?.output?.statusCode;
    if ([515, 503, 408].includes(code)) return;
    console.error('⚡ Socket error:', err.message || err);
  });

  return sock;
}

// ── Boot ──────────────────────────────────────────────────────────────────────
printBanner();
cleanupPuppeteerCache();

startBot().catch(err => {
  console.error('❌ Fatal boot error:', err);
  process.exit(1);
});

// ── Process-level error guards ────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  if (err.code === 'ENOSPC' || err.errno === -28 || err.message?.includes('no space left')) {
    console.error('⚠️ ENOSPC — attempting cleanup...');
    try { cleanupOldFiles(); } catch { /* ignore */ }
    return;
  }
  console.error('⚠️ Uncaught:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason?.message || String(reason);
  if (msg.includes('rate-overlimit') || msg.includes('not-authorized')) return;
  console.error('⚠️ Unhandled rejection:', msg);
});

process.on('SIGINT',  () => { console.log('\n👋 NovaSpark Bot stopped.'); process.exit(0); });
process.on('SIGTERM', () => { console.log('\n👋 NovaSpark Bot stopped.'); process.exit(0); });
