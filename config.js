/**
 * Global Configuration — NovaSpark Bot
 * Version: 2.0.0 — by Dev-Ntando
 */

module.exports = {

  // ── Owner ─────────────────────────────────────────────────────────────────
  ownerNumber: ['263786831091', '263777124998'],
  ownerName:   ['Dev-Ntando', 'Mr Ntando Ofc'],

  // ── Bot ───────────────────────────────────────────────────────────────────
  botName:     'NovaSpark Bot',
  prefix:      '.',
  sessionName: 'session',
  sessionID:   process.env.SESSION_ID || '',
  timezone:    'Africa/Harare',

  // ── API Keys (optional — AI falls back to free endpoints if not set) ──────
  apiKeys: {
    openai:    process.env.OPENAI_API_KEY    || '',
    deepai:    process.env.DEEPAI_API_KEY    || '',
    remove_bg: process.env.REMOVE_BG_API_KEY || '',
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {
    wait:           '⏳ Please wait...',
    success:        '✅ Done!',
    error:          '❌ Something went wrong.',
    ownerOnly:      '👑 This command is only for the bot owner!',
    adminOnly:      '🛡️ Admins only!',
    groupOnly:      '👥 Groups only!',
    privateOnly:    '💬 Private chat only!',
    botAdminNeeded: '🤖 I need to be an admin to do that!',
    invalidCommand: '❓ Unknown command. Type .myplan for help.',
    premiumOnly:    '💎 This is a Premium feature. Type .myplan to upgrade.',
  },

  // ── Defaults ──────────────────────────────────────────────────────────────
  defaultGroupSettings: {
    welcome:  false,
    goodbye:  false,
    muted:    false,
    autochat: false,
  },

};
