/**
 * ⚡ NovaSpark Bot v11.1 — Trial & Licence System
 *
 * HOW IT WORKS
 * ────────────
 * 1. When the bot pairs for the first time (session folder is created),
 *    a trial start timestamp is written to database/trial.json.
 * 2. Every command call passes through isBotAllowed():
 *    - If the sender is a PREMIUM number → always allowed.
 *    - If within TRIAL_DAYS (7) of first pair → allowed.
 *    - Otherwise → bot sends an expiry message and returns false.
 * 3. Owner/admin commands (eval, shutdown, restart, etc.) are ALWAYS allowed
 *    for the PREMIUM numbers regardless of trial state.
 *
 * PREMIUM NUMBERS (hardcoded — always work, no expiry):
 *   263786831091, 263777124998, 263771629199
 *
 * Trial can also be extended via the database/trial.json file:
 *   { "startedAt": <epoch ms>, "extendedDays": 7 }
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const TRIAL_FILE = path.join(__dirname, '..', 'database', 'trial.json');
const TRIAL_DAYS = 7; // free trial duration

// ── Hardcoded premium numbers (always work, no expiry) ────────────────────────
const PREMIUM_NUMBERS = new Set([
  '263786831091',
  '263777124998',
  '263771629199',
]);

// ── Cache trial data in memory to avoid repeated disk reads ──────────────────
let _trialCache = null;

function _loadTrial() {
  if (_trialCache) return _trialCache;
  try {
    if (fs.existsSync(TRIAL_FILE)) {
      _trialCache = JSON.parse(fs.readFileSync(TRIAL_FILE, 'utf-8'));
    }
  } catch {}
  return _trialCache || null;
}

function _saveTrial(data) {
  try {
    const dir = path.dirname(TRIAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TRIAL_FILE, JSON.stringify(data, null, 2));
    _trialCache = data;
  } catch (e) {
    console.error('[TRIAL] Failed to save trial.json:', e.message);
  }
}

/**
 * Called once when the bot first comes online.
 * If no trial record exists, creates one with now as the start date.
 */
function initTrial() {
  const existing = _loadTrial();
  if (!existing || !existing.startedAt) {
    const data = {
      startedAt:    Date.now(),
      extendedDays: 0,
      note:         'NovaSpark Bot 7-day free trial started',
    };
    _saveTrial(data);
    console.log('[TRIAL] ✅ 7-day free trial started.');
  } else {
    const daysLeft = getTrialDaysLeft();
    if (daysLeft > 0) {
      console.log(`[TRIAL] ✅ Trial active — ${daysLeft} day(s) remaining.`);
    } else {
      console.log('[TRIAL] ⚠️  Trial expired. Only premium numbers can use the bot.');
    }
  }
}

/**
 * Returns true if the bot is within its trial window.
 */
function isTrialActive() {
  const data = _loadTrial();
  if (!data || !data.startedAt) return false; // no trial started yet
  const extra    = (data.extendedDays || 0) * 24 * 60 * 60 * 1000;
  const expiry   = data.startedAt + (TRIAL_DAYS * 24 * 60 * 60 * 1000) + extra;
  return Date.now() < expiry;
}

/**
 * Returns the number of full days remaining in the trial (0 if expired).
 */
function getTrialDaysLeft() {
  const data = _loadTrial();
  if (!data || !data.startedAt) return 0;
  const extra  = (data.extendedDays || 0) * 24 * 60 * 60 * 1000;
  const expiry = data.startedAt + (TRIAL_DAYS * 24 * 60 * 60 * 1000) + extra;
  const diff   = expiry - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

/**
 * Returns the trial expiry date as a human-readable string.
 */
function getTrialExpiryDate() {
  const data = _loadTrial();
  if (!data || !data.startedAt) return 'Unknown';
  const extra  = (data.extendedDays || 0) * 24 * 60 * 60 * 1000;
  const expiry = new Date(data.startedAt + (TRIAL_DAYS * 24 * 60 * 60 * 1000) + extra);
  return expiry.toLocaleDateString('en-ZA', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

/**
 * Extend the trial by N additional days.
 * @param {number} days
 */
function extendTrial(days) {
  const data = _loadTrial() || { startedAt: Date.now(), extendedDays: 0 };
  data.extendedDays = (data.extendedDays || 0) + days;
  _saveTrial(data);
  return data;
}

/**
 * Check if a phone number is premium (always allowed).
 * Accepts full JID (e.g. 263786831091@s.whatsapp.net) or plain number.
 * @param {string} jidOrNumber
 */
function isPremiumNumber(jidOrNumber) {
  const num = String(jidOrNumber || '').replace(/\D/g, '').replace(/^0+/, '');
  return PREMIUM_NUMBERS.has(num);
}

/**
 * The main gate — call this before every command.
 * Returns { allowed: true } or { allowed: false, reason: 'trial_expired' | 'premium_only' }
 *
 * @param {string} senderJid  - e.g. "263786831091@s.whatsapp.net"
 */
function isBotAllowed(senderJid) {
  // Premium numbers are ALWAYS allowed
  if (isPremiumNumber(senderJid)) {
    return { allowed: true, premium: true };
  }

  // Trial active → allow
  if (isTrialActive()) {
    return { allowed: true, premium: false, daysLeft: getTrialDaysLeft() };
  }

  // Trial expired → block
  return {
    allowed:      false,
    reason:       'trial_expired',
    expiredOn:    getTrialExpiryDate(),
    message:      buildExpiredMessage(),
  };
}

/**
 * Build the WhatsApp message sent to users when the trial has expired.
 */
function buildExpiredMessage() {
  return `⏰ *NovaSpark Bot — Trial Expired*\n\n` +
         `Your 7-day free trial has ended.\n\n` +
         `To continue using NovaSpark Bot, contact the bot owner to activate a premium licence.\n\n` +
         `📞 *Owner Contact:*\n` +
         `wa.me/263786831091\n\n` +
         `_Thank you for trying NovaSpark Bot! ⚡_`;
}

module.exports = {
  initTrial,
  isTrialActive,
  getTrialDaysLeft,
  getTrialExpiryDate,
  extendTrial,
  isPremiumNumber,
  isBotAllowed,
  PREMIUM_NUMBERS,
  TRIAL_DAYS,
};
