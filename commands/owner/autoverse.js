/**
 * ⚡ NovaSpark Bot v6.0 — 2026 Edition
 * .autoverse — Daily Bible verse sender
 * Fetches a verse from bible-api.com (free, no key needed)
 * and sends it to configured targets at a scheduled time.
 * Owner only.
 * By Dev-Ntando
 */
'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const config = require('../../config');

const DATA_FILE = path.resolve(__dirname, '../../data/autoverse.json');

// Popular daily verse references (rotated by day-of-year)
const VERSES = [
  'john 3:16', 'philippians 4:13', 'jeremiah 29:11', 'psalm 23:1',
  'romans 8:28', 'isaiah 40:31', 'proverbs 3:5-6', 'matthew 6:33',
  'psalm 27:1', '1 corinthians 13:13', 'james 1:2-3', 'ephesians 3:20',
  'hebrews 11:1', 'psalm 46:1', 'joshua 1:9', 'matthew 11:28',
  'romans 5:8', 'philippians 4:6-7', '2 timothy 1:7', 'isaiah 41:10',
  'romans 12:2', 'galatians 6:9', 'psalm 119:105', 'matthew 5:9',
  '1 john 4:4', 'deuteronomy 31:6', 'colossians 3:23', 'romans 8:37',
  'john 14:6', 'psalm 34:8',
];

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return getDefault();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return getDefault(); }
}
function getDefault() {
  const af = config.autoFeatures || {};
  return {
    enabled: (af.autoVerse && af.autoVerse.enabled) || false,
    time:    (af.autoVerse && af.autoVerse.time)    || '07:00',
    targets: (af.autoVerse && af.autoVerse.targets) || [],
  };
}
function writeState(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

function fetchVerse(reference) {
  return new Promise((resolve, reject) => {
    const ref = encodeURIComponent(reference);
    https.get(`https://bible-api.com/${ref}?translation=kjv`, { headers: { 'User-Agent': 'NovaSpark-Bot/6.0' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.text && json.reference) {
            resolve({ text: json.text.trim(), reference: json.reference });
          } else reject(new Error('No verse found'));
        } catch { reject(new Error('Parse error')); }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function getTodayVerse() {
  const day = Math.floor(Date.now() / 86400000);
  return VERSES[day % VERSES.length];
}

const _sent = new Set();
let _timer  = null;

module.exports.startAutoVerseScheduler = function startAutoVerseScheduler(sock) {
  if (_timer) return;
  _timer = setInterval(async () => {
    const s   = readState();
    if (!s.enabled) return;
    const tz  = config.timezone || 'Africa/Harare';
    const now = new Date().toLocaleTimeString('en-ZA', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
    if (s.time !== now) return;
    const key = `verse_${now}`;
    if (_sent.has(key)) return;
    _sent.add(key);

    const verseRef = getTodayVerse();
    let msgText;
    try {
      const verse = await fetchVerse(verseRef);
      msgText =
        `📖 *Daily Bible Verse*\n${'━'.repeat(28)}\n\n` +
        `_"${verse.text}"_\n\n` +
        `📌 *${verse.reference}* (KJV)\n\n` +
        `⚡ NovaSpark Bot | Type *.verse* for a random verse`;
    } catch {
      msgText = `📖 *Daily Bible Verse*\n\n📌 *${verseRef.toUpperCase()}*\n\n_Could not fetch verse. Please read it yourself today!_`;
    }

    const targets = s.targets && s.targets.length
      ? s.targets
      : [`${Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber}@s.whatsapp.net`];

    for (const jid of targets) {
      try { await sock.sendMessage(jid, { text: msgText }); } catch {}
    }

    const [h, m] = now.split(':').map(Number);
    if (h === 0 && m === 0) _sent.clear();
  }, 60000);
};

module.exports = {
  ...module.exports,

  name: 'autoverse',
  aliases: ['dailyverse', 'autoversepost', 'autoverse2'],
  description: 'Daily Bible verse auto-sender + on-demand verse',
  category: 'owner',
  ownerOnly: true,
  usage: '.autoverse on <HH:MM> | .autoverse off | .autoverse addhere | .autoverse now | .autoverse status',

  async execute({ sock, args, reply, from }) {
    const action = (args[0] || '').toLowerCase();
    const s      = readState();

    if (!action || action === 'status') {
      return reply(
        `📖 *Auto Bible Verse*\n${'━'.repeat(28)}\n\n` +
        `Status: *${s.enabled ? '🟢 ON' : '🔴 OFF'}*\n` +
        `Time:   *${s.time}*\n` +
        `Targets: ${s.targets.length ? s.targets.join(', ') : 'Owner DM'}\n\n` +
        `_Usage: .autoverse on 07:00_`
      );
    }

    if (action === 'on' || action === 'enable') {
      const time = args[1] || '07:00';
      if (!/^\d{2}:\d{2}$/.test(time)) return reply('❌ Invalid time. Use HH:MM format.');
      s.enabled = true;
      s.time    = time;
      writeState(s);
      module.exports.startAutoVerseScheduler(sock);
      return reply(`✅ *Auto Verse ON* — daily verse at *${time}* (${config.timezone})`);
    }

    if (action === 'off' || action === 'disable') {
      s.enabled = false;
      writeState(s);
      return reply('🔕 *Auto Verse OFF*.');
    }

    if (action === 'addhere') {
      if (!s.targets.includes(from)) s.targets.push(from);
      writeState(s);
      return reply('✅ This chat added to daily verse targets.');
    }

    if (action === 'removehere') {
      s.targets = s.targets.filter(t => t !== from);
      writeState(s);
      return reply('✅ This chat removed from daily verse targets.');
    }

    // Send verse right now (on-demand or test)
    if (action === 'now' || action === 'test' || !action) {
      await reply('📖 Fetching verse...');
      try {
        const ref   = getTodayVerse();
        const verse = await fetchVerse(ref);
        return reply(
          `📖 *Bible Verse*\n${'━'.repeat(28)}\n\n` +
          `_"${verse.text}"_\n\n` +
          `📌 *${verse.reference}* (KJV)\n\n` +
          `⚡ NovaSpark Bot`
        );
      } catch {
        return reply(`📖 *Bible Verse*\n\n📌 *${getTodayVerse().toUpperCase()}*\n\n_Could not fetch verse. Try again later._`);
      }
    }

    return reply('❓ Usage: `.autoverse on 07:00` | `.autoverse off` | `.autoverse addhere` | `.autoverse now`');
  },
};
