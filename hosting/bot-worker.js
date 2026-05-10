'use strict';
/**
 * NovaSpark Multi-Hosting — Bot Worker
 * One instance of this runs per user bot.
 * Communicates with manager via JSON events on stdout.
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

const path = require('path');
const fs   = require('fs');

const BOT_ID      = process.env.BOT_ID;
const SESSION_DIR = process.env.SESSION_DIR;
const ROOT_DIR    = process.env.ROOT_DIR || path.join(__dirname, '..');

// Emit structured events to manager
function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

// Suppress noisy Baileys logs
const SUPPRESS = ['sessionentry','prekey','ratchet','_chains','signal protocol','chainkey','currentratchet','registrationid','closing session','basekeypair','remoteid','pendingprekey','ephemeralkeypair','rootkey','indexinfo'];
const _check = (a) => a.map(x => typeof x === 'string' ? x : (x ? JSON.stringify(x) : '')).join(' ').toLowerCase().split('').some((_, i, arr) => SUPPRESS.some(s => arr.slice(i).join('').startsWith(s)));
const _orig = { log: console.log, error: console.error, warn: console.warn };
console.log   = (...a) => { if (!_check(a)) _orig.log(...a); };
console.error = (...a) => { if (!_check(a)) _orig.error(...a); };
console.warn  = (...a) => { if (!_check(a)) _orig.warn(...a); };

const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const config  = require(path.join(ROOT_DIR, 'config'));
const handler = require(path.join(ROOT_DIR, 'handler'));

// ── Restore SESSION_ID to session dir ────────────────────────────────────────
function restoreSession() {
  const sid = process.env.SESSION_ID || '';
  if (!sid.startsWith('NovaSpark!')) return;
  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
  const existing = fs.readdirSync(SESSION_DIR).filter(f => !f.startsWith('.'));
  if (existing.length > 0) return;
  try {
    const b64   = sid.slice('NovaSpark!'.length);
    const json  = Buffer.from(b64, 'base64').toString('utf-8');
    const files = JSON.parse(json);
    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(SESSION_DIR, path.basename(name)), content, 'utf-8');
    }
  } catch (e) {
    emit({ type: 'error', message: 'Failed to restore session: ' + e.message });
  }
}

// ── Encode session to NovaSpark!... string ───────────────────────────────────
function encodeSession(dir) {
  try {
    const files = {};
    for (const entry of fs.readdirSync(dir)) {
      const fp = path.join(dir, entry);
      if (fs.statSync(fp).isFile()) files[entry] = fs.readFileSync(fp, 'utf-8');
    }
    return 'NovaSpark!' + Buffer.from(JSON.stringify(files)).toString('base64');
  } catch { return null; }
}

// ── Bot config overrides from env ────────────────────────────────────────────
const botConfig = {
  ...config,
  botName:     process.env.BOT_NAME     || config.botName,
  ownerNumber: process.env.OWNER_NUMBER ? [process.env.OWNER_NUMBER] : config.ownerNumber,
  prefix:      process.env.PREFIX       || config.prefix,
  sessionName: SESSION_DIR,
};

let _retries = 0;
const MAX_RETRIES = 5;

async function startBot() {
  restoreSession();

  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: [`${botConfig.botName}`, 'Chrome', '120.0.0'],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: undefined,
  });

  const ownerNumber = Array.isArray(botConfig.ownerNumber) ? botConfig.ownerNumber[0] : botConfig.ownerNumber;
  let _pairRequested = false;

  // ── Heartbeat ──────────────────────────────────────────────────────────────
  const heartbeat = setInterval(() => emit({ type: 'heartbeat' }), 30000);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && ownerNumber && !_pairRequested) {
      _pairRequested = true;
      try {
        const code = await sock.requestPairingCode(ownerNumber.replace(/\D/g, ''));
        emit({ type: 'pair_code', code });
      } catch (e) {
        emit({ type: 'error', message: 'Pairing code failed: ' + e.message });
      }
    }

    if (connection === 'open') {
      _retries = 0;
      const number = sock.user?.id?.split(':')[0] || ownerNumber;
      emit({ type: 'online', number });

      // Save session
      const sid = encodeSession(SESSION_DIR);
      if (sid) emit({ type: 'session_id', sessionID: sid });
    }

    if (connection === 'close') {
      clearInterval(heartbeat);
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut  = statusCode === DisconnectReason.loggedOut;

      if (loggedOut) {
        emit({ type: 'offline' });
        process.exit(0);
      } else if (_retries < MAX_RETRIES) {
        _retries++;
        emit({ type: 'error', message: `Disconnected (${statusCode}), retry ${_retries}/${MAX_RETRIES}...` });
        setTimeout(startBot, 5000 * _retries);
      } else {
        emit({ type: 'error', message: 'Max retries reached. Bot stopped.' });
        process.exit(1);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('call', async (calls) => {
    for (const c of calls) {
      if (c.status !== 'offer') continue;
      try { await sock.rejectCall(c.id, c.from); } catch {}
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;
      if (msg.key.fromMe) continue;
      try {
        // Temporarily override config for this bot instance
        const origConfig = require.cache[require.resolve(path.join(ROOT_DIR, 'config'))];
        if (origConfig) origConfig.exports = { ...origConfig.exports, ...botConfig };
        await handler(sock, msg);
      } catch (e) {
        _orig.error(`[BOT:${BOT_ID}] Handler error:`, e.message);
      }
    }
  });

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      if (action === 'add') {
        const meta = await sock.groupMetadata(id).catch(() => null);
        const count = meta?.participants?.length || 0;
        for (const jid of participants) {
          const num = jid.split('@')[0];
          const txt = `👋 Welcome to *${meta?.subject || 'the group'}*, @${num}! 🎉\nWe now have *${count}* members.`;
          await sock.sendMessage(id, { text: txt, mentions: [jid] });
        }
      }
    } catch {}
  });
}

startBot().catch(e => {
  emit({ type: 'error', message: e.message });
  process.exit(1);
});
