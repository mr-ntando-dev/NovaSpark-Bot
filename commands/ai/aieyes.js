/**
 * ⚡ NovaSpark Bot v10 — AI Eyes 👁️
 * Always-on AI monitoring system that watches all messages silently.
 * 
 * Features:
 * - Detects scams, spam, suspicious links, and threats
 * - Identifies toxic/hate speech before it escalates
 * - Flags potential self-harm or crisis messages for owner
 * - Detects NSFW content and auto-deletes
 * - Monitors group health (spam patterns, raid attempts)
 * - Alerts owner via DM when something important is detected
 * - Learns patterns over time
 *
 * .aieyes on/off          — Toggle AI Eyes (default: ON)
 * .aieyes status          — View current status & stats
 * .aieyes sensitivity <1-5> — Set alert sensitivity
 * .aieyes alerts on/off   — Toggle owner DM alerts
 * .aieyes log             — View recent detections
 *
 * AI Eyes is ALWAYS ON by default — it protects silently.
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');
const config   = require('../../config');
const APIs     = require('../../utils/api');

// ── Detection patterns (rule-based fast check before AI) ──────────────────────
const SCAM_PATTERNS = [
  /free\s*(iphone|money|gift|cash|bitcoin|crypto)/i,
  /click\s*(here|this|now)\s*to\s*(win|claim|get)/i,
  /congratulations.*won/i,
  /send\s*\d+\s*(usd|zar|rand|dollar)/i,
  /invest\s*now.*guaranteed/i,
  /whatsapp\s*gold/i,
  /your\s*account\s*(will\s*be|has\s*been)\s*(suspended|closed|deleted)/i,
  /verify\s*your\s*(account|identity)\s*now/i,
];

const THREAT_PATTERNS = [
  /i('ll|m\s*going\s*to)\s*kill/i,
  /bomb\s*threat/i,
  /shoot\s*(up|you)/i,
];

const NSFW_PATTERNS = [
  /onlyfans\.com/i,
  /porn|xxx|nude\s*pic/i,
];

const RAID_THRESHOLD = 5; // messages from same sender in 30 seconds

// ── In-memory tracking ────────────────────────────────────────────────────────
const recentMessages = new Map(); // sender -> [{ts, text}]
const detectionLog = [];
const MAX_LOG = 50;

function logDetection(type, sender, text, group, action) {
  detectionLog.unshift({
    type, sender, text: text.slice(0, 100),
    group, action, ts: Date.now(),
  });
  if (detectionLog.length > MAX_LOG) detectionLog.pop();
}

// ── AI analysis for ambiguous content ─────────────────────────────────────────
async function aiAnalyze(text) {
  try {
    const system = `You are a content safety classifier. Analyze the message and respond with ONLY a JSON object:
{"safe": true/false, "category": "scam|threat|nsfw|spam|hate|crisis|clean", "confidence": 0.0-1.0, "reason": "brief reason"}
Be conservative — only flag clearly harmful content. Do NOT flag normal conversations, jokes, or mild language.`;
    const result = await APIs.chatAI(`Classify this message: "${text}"`, system);
    return JSON.parse(result);
  } catch {
    return { safe: true, category: 'clean', confidence: 0, reason: 'analysis failed' };
  }
}

// ── Flood detection ───────────────────────────────────────────────────────────
function checkFlood(sender) {
  const now = Date.now();
  const msgs = recentMessages.get(sender) || [];
  // Keep only last 30 seconds
  const recent = msgs.filter(m => now - m.ts < 30000);
  recentMessages.set(sender, recent);
  return recent.length >= RAID_THRESHOLD;
}

function trackMessage(sender, text) {
  const msgs = recentMessages.get(sender) || [];
  msgs.push({ ts: Date.now(), text });
  recentMessages.set(sender, msgs.slice(-20));
}

module.exports = {
  name: 'aieyes',
  aliases: ['aieye', 'aiwatch', 'aimonitor', 'eyes'],
  description: 'AI Eyes — always-on AI monitoring and protection system',
  category: 'ai',
  ownerOnly: false,

  /**
   * Called by handler on EVERY message (before command processing)
   * Returns: { action: 'none'|'delete'|'warn'|'alert', reason: string } or null
   */
  monitor: async ({ sock, msg, from, sender, body, isGroup, isAdmin, isOwner }) => {
    // Check if AI Eyes is enabled (default: true)
    const enabled = database.getGlobalSetting
      ? database.getGlobalSetting('aiEyes') !== false
      : true;
    if (!enabled) return null;
    if (isOwner) return null; // Never flag owner

    if (!body || body.length < 3) return null;

    const sensitivity = database.getGlobalSetting
      ? (database.getGlobalSetting('aiEyesSensitivity') || 3)
      : 3;

    trackMessage(sender, body);

    // ── Fast rule-based checks ──────────────────────────────────────────────
    // Scam check
    for (const pattern of SCAM_PATTERNS) {
      if (pattern.test(body)) {
        logDetection('scam', sender, body, from, 'alert');
        await alertOwner(sock, '🚨 Scam Detected', sender, body, from);
        return { action: 'alert', reason: 'Scam pattern detected' };
      }
    }

    // Threat check
    for (const pattern of THREAT_PATTERNS) {
      if (pattern.test(body)) {
        logDetection('threat', sender, body, from, 'alert');
        await alertOwner(sock, '⚠️ Threat Detected', sender, body, from);
        return { action: 'alert', reason: 'Threat detected' };
      }
    }

    // NSFW check
    if (sensitivity >= 3) {
      for (const pattern of NSFW_PATTERNS) {
        if (pattern.test(body)) {
          logDetection('nsfw', sender, body, from, 'delete');
          await alertOwner(sock, '🔞 NSFW Content', sender, body, from);
          return { action: 'delete', reason: 'NSFW content' };
        }
      }
    }

    // Flood detection
    if (isGroup && checkFlood(sender)) {
      logDetection('flood', sender, body, from, 'warn');
      await alertOwner(sock, '🌊 Flood/Raid', sender, `${body.slice(0, 50)}... (rapid messages)`, from);
      return { action: 'warn', reason: 'Message flooding detected' };
    }

    // ── AI deep analysis for longer or suspicious messages ───────────────────
    if (sensitivity >= 4 && body.length > 50) {
      const analysis = await aiAnalyze(body);
      if (!analysis.safe && analysis.confidence > 0.7) {
        logDetection(analysis.category, sender, body, from, 'alert');
        await alertOwner(sock, `🤖 AI Eyes: ${analysis.category}`, sender, body, from);
        if (analysis.category === 'crisis') {
          return { action: 'alert', reason: 'Crisis content - owner alerted' };
        }
        return { action: 'alert', reason: analysis.reason };
      }
    }

    return null;
  },

  execute: async ({ sock, msg, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      if (database.setGlobalSetting) database.setGlobalSetting('aiEyes', true);
      return reply(
        '👁️ *AI Eyes: ACTIVATED*\n\n' +
        '🛡️ Now monitoring all messages for:\n' +
        '  • Scams & phishing\n' +
        '  • Threats & violence\n' +
        '  • NSFW content\n' +
        '  • Spam & flooding\n' +
        '  • Hate speech\n' +
        '  • Crisis messages\n\n' +
        '_AI Eyes works silently in the background._\n' +
        '_You will receive DM alerts for detections._'
      );
    }
    if (sub === 'off') {
      if (database.setGlobalSetting) database.setGlobalSetting('aiEyes', false);
      return reply('👁️ *AI Eyes: DEACTIVATED*\n\n⚠️ Protection disabled. Your groups are unmonitored.');
    }
    if (sub === 'sensitivity' || sub === 'level') {
      const level = parseInt(args[1]);
      if (!level || level < 1 || level > 5) return reply(
        '❌ Usage: `.aieyes sensitivity <1-5>`\n\n' +
        '1 = Only obvious threats\n' +
        '2 = Threats + scams\n' +
        '3 = + NSFW (default)\n' +
        '4 = + AI deep analysis\n' +
        '5 = Maximum (may over-flag)'
      );
      if (database.setGlobalSetting) database.setGlobalSetting('aiEyesSensitivity', level);
      return reply(`✅ AI Eyes sensitivity set to *Level ${level}*.`);
    }
    if (sub === 'alerts') {
      const toggle = (args[1] || '').toLowerCase();
      if (toggle === 'on') {
        if (database.setGlobalSetting) database.setGlobalSetting('aiEyesAlerts', true);
        return reply('🔔 *AI Eyes Alerts: ON* — You will get DMs for detections.');
      }
      if (toggle === 'off') {
        if (database.setGlobalSetting) database.setGlobalSetting('aiEyesAlerts', false);
        return reply('🔕 *AI Eyes Alerts: OFF* — No DM alerts (still monitoring).');
      }
      return reply('Usage: `.aieyes alerts on/off`');
    }
    if (sub === 'log' || sub === 'logs') {
      if (!detectionLog.length) return reply('📭 No detections yet. AI Eyes is watching silently.');
      const lines = detectionLog.slice(0, 15).map((d, i) => {
        const time = new Date(d.ts).toLocaleTimeString('en-ZA', { hour12: false });
        const num = d.sender.split('@')[0];
        return `${i + 1}. [${time}] *${d.type}* — +${num}\n   _"${d.text.slice(0, 60)}..."_`;
      }).join('\n\n');
      return reply(`👁️ *AI Eyes — Detection Log*\n\n${lines}`);
    }

    // Status
    const isOn = database.getGlobalSetting ? database.getGlobalSetting('aiEyes') !== false : true;
    const sensitivity = database.getGlobalSetting ? (database.getGlobalSetting('aiEyesSensitivity') || 3) : 3;
    const alerts = database.getGlobalSetting ? database.getGlobalSetting('aiEyesAlerts') !== false : true;
    return reply(
      '👁️ *A I   E Y E S*\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      `Status: *${isOn ? '🟢 ACTIVE' : '🔴 INACTIVE'}*\n` +
      `Sensitivity: *Level ${sensitivity}/5*\n` +
      `DM Alerts: *${alerts ? 'ON 🔔' : 'OFF 🔕'}*\n` +
      `Detections today: *${detectionLog.filter(d => Date.now() - d.ts < 86400000).length}*\n\n` +
      '`.aieyes on/off` — Toggle\n' +
      '`.aieyes sensitivity 1-5` — Set level\n' +
      '`.aieyes alerts on/off` — DM notifications\n' +
      '`.aieyes log` — Recent detections\n\n' +
      '_👁️ AI Eyes is always watching. Always protecting._'
    );
  },
};

// ── Alert owner via DM ────────────────────────────────────────────────────────
async function alertOwner(sock, title, sender, text, group) {
  try {
    const alertsEnabled = database.getGlobalSetting
      ? database.getGlobalSetting('aiEyesAlerts') !== false
      : true;
    if (!alertsEnabled) return;

    const ownerNum = Array.isArray(config.ownerNumber) ? config.ownerNumber[0] : config.ownerNumber;
    const ownerJid = `${ownerNum}@s.whatsapp.net`;
    const senderNum = sender.split('@')[0];
    const groupName = group.endsWith('@g.us') ? group.split('@')[0] : 'DM';

    await sock.sendMessage(ownerJid, {
      text: `👁️ *AI EYES ALERT*\n\n` +
        `${title}\n\n` +
        `👤 From: +${senderNum}\n` +
        `📍 In: ${groupName}\n` +
        `💬 Message:\n_"${text.slice(0, 200)}"_\n\n` +
        `⏰ ${new Date().toLocaleString('en-ZA', { timeZone: config.timezone || 'Africa/Harare' })}`,
    });
  } catch {}
}
