/**
 * ⚡ NovaSpark Bot v5 — 2026 EDITION
 * Global Configuration
 * By Dev-Ntando
 */

module.exports = {

  // ── Owner ─────────────────────────────────────────────────────────────────
  ownerNumber: ['263786831091', '263777124998'],
  ownerName:   ['Dev-Ntando', 'Mr Ntando Ofc'],

  // ── Bot ───────────────────────────────────────────────────────────────────
  botName:     'NovaSpark Bot',
  botVersion:  '5.0.0',
  prefix:      '.',
  sessionName: process.env.SESSION_DIR || 'session',
  sessionID:   process.env.SESSION_ID  || '',
  timezone:    'Africa/Harare',

  // ── Branding ──────────────────────────────────────────────────────────────
  channelLink: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A',

  // ── API Keys ─────────────────────────────────────────────────────────────
  apiKeys: {
    openai:    process.env.OPENAI_API_KEY    || '',
    deepai:    process.env.DEEPAI_API_KEY    || '',
    remove_bg: process.env.REMOVE_BG_API_KEY || '',
    giphy:     process.env.GIPHY_API_KEY     || '',
  },

  // ── Anti-Spam ─────────────────────────────────────────────────────────────
  rateLimitPerMinute: 15,

  // ── AI Persona ────────────────────────────────────────────────────────────
  defaultPersona: 'friendly',

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {
    wait:           '⏳ Please wait...',
    success:        '✅ Done!',
    error:          '❌ Something went wrong. Try again.',
    ownerOnly:      '👑 Owner only command!',
    adminOnly:      '🛡️ Admins only!',
    groupOnly:      '👥 Groups only!',
    privateOnly:    '💬 Private chat only!',
    botAdminNeeded: '🤖 I need admin rights first!',
    invalidCommand: '❓ Unknown command. Type .menu for help.',
    premiumOnly:    '💎 Premium feature. Type .upgrade to unlock.',
    rateLimited:    '🚦 Slow down! Too many commands.',
  },

  // ── Default Group Settings ────────────────────────────────────────────────
  defaultGroupSettings: {
    welcome:        false,
    goodbye:        false,
    muted:          false,
    autochat:       false,
    antilink:       false,
    antiword:       false,
    antispam:       true,
    antitoxic:      true,
    autoReact:      true,
    ghostMode:      true,
    vipOnly:        true,
    nightMode:      true,
    nightStart:     '22:00',
    nightEnd:       '06:00',
    linkWhitelist:  [],
    badWords:       [],
    welcomeMsg:     '',
    goodbyeMsg:     '',
    maxWarn:        3,
  },
};
