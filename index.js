/**
 * ⚡ NovaSpark Bot v7.0 — 2026 EDITION
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

// ── v7.0 owner auto-commands — startup hooks ──────────────────────────────────
const autoonlineCmd  = require('./commands/owner/autoonline');
const autobackupCmd  = require('./commands/owner/autobackup');
const autoleaveCmd   = require('./commands/owner/autoleave');
const autoprotectCmd = require('./commands/owner/autoprotect');

// ── Banner ─────────────────────────────────────────────────────────────────────
function printBanner() {
  const owners = Array.isArray(config.ownerName) ? config.ownerName.join(', ') : config.ownerName;
  orig.log([
    '',
    '╔══════════════════════════════════════════════╗',
    '  ⚡   N O V A S P A R K   B O T   v7  ⚡',
    '       2 0 2 6  E D I T I O N',
    '╚══════════════════════════════════════════════╝',
    '',
    `   📦  Version : ${config.botVersion}`,
    `   ⚡  Prefix  : ${config.prefix}`,
    `   👑  Owner   : ${owners}`,
    '',
    '   🌙 Night Mode    ✅ | 👻 Ghost Mode   ✅',
    '   🧠 Anti-Toxic    ✅ | ⭐ VIP Mode     ✅',
    '   🎮 Wordle/Trivia ✅ | 🎵 TikTok DL   ✅',
    '   🖼️  Remove BG    ✅ | 💕 Ship Score   ✅',
    '   🛡️  AutoProtect  ✅ | 🔗 AntiLink v7  ✅',
    '   🚫 AntiSpam      ✅ | 📨 AntiFWD     ✅',
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

  // ── Decode SESSION_ID BEFORE loading auth state ──────────────────────────
  // CRITICAL: creds.json must exist on disk before useMultiFileAuthState()
  // is called — otherwise the socket starts with empty credentials and
  // WhatsApp issues a 401 (logged out) immediately.
  const sessionPath = path.join(sessionDir, 'creds.json');
  if (config.sessionID && config.sessionID !== '' && !fs.existsSync(sessionPath)) {
    try {
      const zlib = require('zlib');
      const b64  = config.sessionID
        .replace(/^NovaSpark!/, '')
        .replace(/^KnightBot!/, '');
      const buf          = Buffer.from(b64, 'base64');
      const decompressed = zlib.gunzipSync(buf).toString('utf-8');
      // Validate it's parseable JSON before writing
      JSON.parse(decompressed);
      fs.writeFileSync(sessionPath, decompressed);
      orig.log('✅ Session loaded from SESSION_ID.');
    } catch (e) {
      orig.log('⚠️  Could not decode SESSION_ID — falling back to QR scan. Error: ' + e.message);
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth:   state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    keepAliveIntervalMs:   10000,
    connectTimeoutMs:      60000,
    defaultQueryTimeoutMs: 30000,
    emitOwnEvents: false,
  });

  // ── QR fallback (only when no SESSION_ID set) ────────────────────────────
  if (!config.sessionID || config.sessionID === '') {
    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) {
        orig.log('\n📱 Scan this QR code to connect:\n');
        qrcode.generate(qr, { small: true });
      }
    });
  }

  // ── Connection events ─────────────────────────────────────────────────────
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      printOnline(sock);
      // ── v5.3: start owner auto-loops on connect ────────────────────────────
      const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
      const ownerJid = `${ownerNum}@s.whatsapp.net`;
      try { autoonlineCmd.startOnlineLoop(sock); } catch {}
      try { autobackupCmd.startBackupLoop(sock, ownerJid); } catch {}
      // v7: AutoProtect suite — privacy lock, anti-call, anti-scam DM
      try { autoprotectCmd.onBotOnline(sock); } catch (e) {
        orig.warn('[AutoProtect] startup warn:', e.message);
      }
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;

      // ── 401: Hard logout ────────────────────────────────────────────────
      // WhatsApp revoked the session. Do NOT reconnect — the session is dead.
      // User must generate a new SESSION_ID from the pairing site.
      if (code === DisconnectReason.loggedOut) {
        orig.log('\n🔴 Disconnected (code 401). Logged out.');
        orig.log('⚠️  Session revoked by WhatsApp. Generate a new SESSION_ID from the pairing site.');
        process.exit(0); // Let Render restart the process after user updates SESSION_ID
        return;
      }

      // ── 515: Restart required ───────────────────────────────────────────
      // Normal after a successful pairing (especially on WhatsApp Business).
      // WhatsApp sends this to tell us to reconnect with the now-saved creds.
      // We must restart startBot() so it re-reads creds.json from disk.
      if (code === DisconnectReason.restartRequired) {
        orig.log('\n🔄 Restart required by WhatsApp — reconnecting with saved session...');
        setTimeout(startBot, 2000);
        return;
      }

      // ── 408 / stream error / all other codes: temporary disconnect ──────
      // Use increasing backoff to avoid rapid reconnect loops that trigger
      // WhatsApp Business account bans.
      const delay = [5000, 10000, 15000, 30000];
      const attempt = (startBot._attempt || 0);
      startBot._attempt = Math.min(attempt + 1, delay.length - 1);
      const wait = delay[startBot._attempt - 1] || 5000;

      orig.log(`\n🔴 Disconnected (code ${code}). Reconnecting in ${wait / 1000}s...`);
      setTimeout(() => {
        startBot._attempt = Math.max((startBot._attempt || 1) - 1, 0); // reduce on success
        startBot();
      }, wait);
    }

    // Reset backoff counter on successful connection
    if (connection === 'open') {
      startBot._attempt = 0;
    }
  });

  // ── Creds save ────────────────────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ── AntiCall (v7 — routes through autoprotect AND legacy anticall) ──────────
  const anticallMod  = require('./commands/owner/anticall');
  const autoreadMod  = require('./commands/owner/autoread');
  sock.ev.on('call', async (calls) => {
    for (const c of calls) {
      if (c.status !== 'offer') continue;
      // AutoProtect handles it (always enabled by default)
      try { await autoprotectCmd.checkCall(sock, c); } catch {}
      // Legacy anticall fallback
      if (anticallMod.anticallState?.enabled) {
        try { await sock.rejectCall(c.id, c.from); } catch {}
      }
    }
  });

  // ── Messages ──────────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;

      // ── fromMe gate — allow owner's own messages through ──────────────────
      // When fromMe=true the bot sent the message, BUT in Baileys multi-device
      // the owner's commands typed on THEIR phone also arrive with fromMe=true.
      // We must let owner messages through; drop everything else that is fromMe.
      if (msg.key.fromMe) {
        // Get the bot's own number so we can compare
        const botNum = sock.user?.id ? sock.user.id.split(':')[0].split('@')[0] : '';
        const ownerNums = (Array.isArray(config.ownerNumber)
          ? config.ownerNumber
          : [config.ownerNumber]
        ).map(n => String(n).replace(/\D/g, ''));

        // For fromMe messages the "sender" is the bot itself (sock.user.id).
        // BUT in multi-device, when the OWNER types on their phone and the bot
        // is on another device, the message arrives with fromMe=true and
        // remoteJid = the chat they are in (not the owner's own number).
        // The only reliable way to identify owner-typed commands:
        // check if the message body starts with the prefix (it's a command)
        // AND the bot's number matches an owner number.
        const prefix = config.prefix || '.';
        const body =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          msg.message?.videoMessage?.caption || '';

        const isCommand = body.trim().startsWith(prefix);
        const botIsOwner = ownerNums.includes(botNum.replace(/\D/g, ''));

        // Let through ONLY if: it's a command AND the bot number is an owner
        if (!(isCommand && botIsOwner)) continue;

        // Patch the message so handler treats sender as the owner's JID
        // Use remoteJid for DMs (that IS the owner chatting with the bot)
        // For groups, participant will be set correctly by Baileys
        if (!msg.key.remoteJid?.endsWith('@g.us') && !msg.key.participant) {
          // In a DM with themselves or bot — set participant to owner JID
          // so handler's isOwner() check works correctly
          msg._ownerOverride = `${ownerNums[0]}@s.whatsapp.net`;
        }
      }

      // AutoRead (v5)
      if (autoreadMod.autoreadState?.enabled) {
        try { await sock.readMessages([msg.key]); } catch {}
      }
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
      // ── v5.3 Auto Leave ──────────────────────────────────────────────────────
      await autoleaveCmd.checkAutoLeave(sock, { id, participants, action });
    } catch {}
    try {
      const gs = require('./database').getGroupSettings(id);

      // ── v7.0 AntiFake — remove suspicious accounts on join ──────────────────
      if (action === 'add') {
        const antifakeMod = require('./commands/group/antifake');
        for (const jid of participants) {
          try { await antifakeMod.checkJoin(sock, id, jid, gs); } catch {}
        }
      }

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
