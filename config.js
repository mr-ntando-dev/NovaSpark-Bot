/**
 * Global Configuration — NovaSpark Bot
 * Version: 1.0.0 — by Dev-Ntando
 */

module.exports = {

  // ────────────────────────────────────────────
  // 👑 OWNER CONFIGURATION
  // ────────────────────────────────────────────
  ownerNumber: ['263786831091', '263777124998'], // Numbers without + or spaces
  ownerName:   ['Dev-Ntando', 'Mr Ntando Ofc'],  // Names matching ownerNumber order

  // ────────────────────────────────────────────
  // ⚡ BOT CONFIGURATION
  // ────────────────────────────────────────────
  botName:     'NovaSpark Bot',
  prefix:      '.',
  sessionName: 'session',
  sessionID:   process.env.SESSION_ID || '',

  // ────────────────────────────────────────────
  // 🔑 API KEYS
  // ────────────────────────────────────────────
  apiKeys: {
    openai:    process.env.OPENAI_API_KEY    || '',
    deepai:    process.env.DEEPAI_API_KEY    || '',
    remove_bg: process.env.REMOVE_BG_API_KEY || '',
  },

  // ────────────────────────────────────────────
  // 💬 DEFAULT MESSAGES
  // ────────────────────────────────────────────
  messages: {
    wait:           '⏳ Please wait...',
    success:        '✅ Done!',
    error:          '❌ Something went wrong.',
    ownerOnly:      '👑 This command is only for the bot owner!',
    adminOnly:      '🛡️ Admins only!',
    groupOnly:      '👥 This command can only be used in groups!',
    privateOnly:    '💬 This command can only be used in private chat!',
    botAdminNeeded: '🤖 I need to be an admin to do that!',
    invalidCommand: '❓ Unknown command.',
    cooldown:       '⏱️ Slow down — please wait a moment.',
  },

  // ────────────────────────────────────────────
  // 🗄️ DATABASE DEFAULTS
  // ────────────────────────────────────────────
  defaultGroupSettings: {
    antilink:  false,
    antitag:   false,
    welcome:   false,
    goodbye:   false,
    muted:     false,
    nsfw:      false,
    autochat:  false,
  },

};
