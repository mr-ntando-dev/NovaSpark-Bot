/**
 * ⚡ NovaSpark Bot v11.0.0 — 2026 TURBO EDITION
 * Global Configuration — ALL auto-features configurable here
 * By Dev-Ntando
 */

module.exports = {

  // ── Owner ─────────────────────────────────────────────────────────────────
  ownerNumber: ['263786831091', '263777124998'],
  ownerName:   ['Dev-Ntando', 'Mr Ntando Ofc'],

  // ── Bot ───────────────────────────────────────────────────────────────────
  botName:     'NovaSpark Bot',
  botVersion:  '11.0.0',
  prefix:      '.',
  sessionName: process.env.SESSION_DIR || 'session',
  sessionID:   process.env.SESSION_ID  || '',
  timezone:    'Africa/Harare',

  // ── Branding ──────────────────────────────────────────────────────────────
  channelLink: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A',

  // ── Menu Image ────────────────────────────────────────────────────────────
  // Local path (relative to bot root) OR a direct image URL
  // Place your custom image as assets/menu_image.jpg to use it
  // Override with env var: MENU_IMAGE_URL=https://your-image-url.com/img.jpg
  menuImagePath: process.env.MENU_IMAGE_URL || 'assets/menu_image.jpg',

  // ── API Keys (set via env vars or fill directly) ──────────────────────────
  apiKeys: {
    openai:     process.env.OPENAI_API_KEY     || '',
    deepai:     process.env.DEEPAI_API_KEY     || '',
    remove_bg:  process.env.REMOVE_BG_API_KEY  || '',
    giphy:      process.env.GIPHY_API_KEY      || '',
    youtube:    process.env.YOUTUBE_API_KEY    || '',
    newsapi:    process.env.NEWS_API_KEY       || '',
    weatherapi: process.env.WEATHER_API_KEY    || '',
  },

  // ── Anti-Spam / Rate Limit ────────────────────────────────────────────────
  rateLimitPerMinute: 15,

  // ── AI Persona ────────────────────────────────────────────────────────────
  defaultPersona: 'friendly',

  // ─────────────────────────────────────────────────────────────────────────
  // AUTO-FEATURES — configure each one here as the global default.
  // Group-level overrides via commands still take priority.
  // ─────────────────────────────────────────────────────────────────────────
  autoFeatures: {

    autoOnline: {
      enabled: true,
      intervalMs: 30000,
    },

    autoRead: {
      enabled: true,
    },

    autoTyping: {
      enabled: true,
      durationMs: 1500,
    },

    autoPMReply: {
      enabled: false,
      message: "Hey! I'm unavailable right now. Type .menu for bot commands.",
    },

    autoGoodMorning: {
      enabled: true,
      time: '06:00',
      message: '🌅 *Good Morning!* Wishing everyone a blessed and productive day!\n\n_⚡ NovaSpark Bot_',
      targets: [],
    },

    autoGoodNight: {
      enabled: true,
      time: '22:00',
      message: '🌙 *Good Night!* Rest well and wake up stronger!\n\n_⚡ NovaSpark Bot_',
      targets: [],
    },

    autoVerse: {
      enabled: true,
      time: '07:00',
      targets: [],
    },

    autoPrayer: {
      enabled: true,
      time: '05:30',
      message: '',
      targets: [],
    },

    autoNews: {
      enabled: false,
      time: '08:00',
      topic: 'world',
      targets: [],
    },

    autoStatus: {
      enabled: true,
      intervalHours: 6,
      message: '',
    },

    autoAnnounce: {
      enabled: false,
      intervalHours: 24,
      message: '⚡ *NovaSpark Bot* is LIVE! Type *.menu* for all commands.',
    },

    autoWelcome: {
      enabled: true,
      defaultMsg: '👋 Welcome @user to *@group*! You are member #@count.\nType *.menu* for bot commands.',
    },

    autoGoodbye: {
      enabled: true,
      defaultMsg: '👋 @user has left *@group*. We will miss you!',
    },

    autoKickInactive: {
      enabled: false,
      daysInactive: 30,
    },

    autoLeave: {
      enabled: true,
      minMembers: 3,
    },

    antiCall: {
      enabled: true,
      blockVideo: true,
      blockVoice: true,
      message: '📵 Calls are not supported. Please send a message instead.',
    },

    antiLink: {
      enabled: true,
      action: 'delete',
    },

    antiToxic: {
      enabled: true,
    },

    antiFlood: {
      enabled: true,
      maxMessages: 10,
      action: 'warn',
    },

    antiRaid: {
      enabled: true,
      threshold: 10,
    },

    antiDelete: {
      enabled: true,
    },

    pmBlocker: {
      enabled: false,
      message: '⚠️ DMs are not accepted. Join a NovaSpark group to interact.',
    },

    waProtect: {
      enabled: true,
    },

    autoReact: {
      enabled: true,
      mode: 'mood',
    },

    autoChat: {
      enabled: false,
      persona: 'friendly',
    },

    autoReplyKeywords: {
      enabled: true,
      pairs: [
        { keyword: 'hi bot',      reply: '👋 Hey! I am NovaSpark Bot. Type .menu for commands.' },
        { keyword: 'hello bot',   reply: '⚡ Hello! How can NovaSpark assist you today?' },
        { keyword: 'good morning',reply: '🌅 Good Morning! Have a blessed day.' },
        { keyword: 'amen',        reply: '🙏 *Amen!* May God bless you abundantly.' },
      ],
    },

    autoNudge: {
      enabled: true,
      daysInactive: 7,
      message: '👋 Hey! We miss you in the group. Come chat with us!',
    },

    autoBackup: {
      enabled: false,
      intervalHours: 24,
    },
  },

  // ── System Messages ───────────────────────────────────────────────────────
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
    ghostMode:      false,
    vipOnly:        false,
    nightMode:      false,
    nightStart:     '22:00',
    nightEnd:       '06:00',
    linkWhitelist:  [],
    badWords:       [],
    welcomeMsg:     '',
    goodbyeMsg:     '',
    maxWarn:        3,
  },

  // ── TB Joshua / Inspiration ───────────────────────────────────────────────
  inspiration: {
    // Short sermon video clips to send as actual video files.
    // url must be a direct mp4 link. Clips should stay under 15 MB.
    tbJoshuaVideos: [
      {
        title: 'The Power of Prayer',
        url:   'https://archive.org/download/tb-joshua-clips/prayer_power.mp4',
        caption: '🙏 *The Power of Prayer*\n_"Prayer is the master key." — TB Joshua_\n\n⚡ NovaSpark Bot | .tbj for more',
      },
      {
        title: 'Faith That Moves Mountains',
        url:   'https://archive.org/download/tb-joshua-clips/faith_mountains.mp4',
        caption: '⛰️ *Faith That Moves Mountains*\n_"If you believe, you will receive." — TB Joshua_\n\n⚡ NovaSpark Bot | .tbj for more',
      },
      {
        title: 'Overcoming Fear',
        url:   'https://archive.org/download/tb-joshua-clips/overcome_fear.mp4',
        caption: '🛡️ *Overcoming Fear*\n_"Fear is a spirit. Counter it with faith." — TB Joshua_\n\n⚡ NovaSpark Bot | .tbj for more',
      },
      {
        title: 'Walking on Water',
        url:   'https://archive.org/download/tb-joshua-clips/walking_water.mp4',
        caption: '🌊 *Walking on Water*\n_"Keep your eyes on Jesus, not the storm." — TB Joshua_\n\n⚡ NovaSpark Bot | .tbj for more',
      },
      {
        title: 'New Day New Beginning',
        url:   'https://archive.org/download/tb-joshua-clips/new_beginning.mp4',
        caption: '☀️ *New Day, New Beginning*\n_"Yesterday is gone. Today is a gift from God." — TB Joshua_\n\n⚡ NovaSpark Bot | .tbj for more',
      },
    ],
    tbJoshuaYouTubeChannel: 'UCZi0hCMGAkOyYWGRYXAB8Dg',
    tbJoshuaQuotes: [
      'Prayer is the master key. Every problem has a lock. Prayer is the key.',
      'Destiny is not a matter of chance. It is a matter of choice.',
      'When God is about to do something wonderful, He begins with a difficulty.',
      'Your greatest test is when you are able to bless someone else while going through your own storm.',
      'Faith is the title deed to what you are believing for.',
      'The enemy is not a person. The enemy is fear, doubt, unbelief, and hatred.',
      'Where there is no vision, the people perish. Get a vision.',
      'Real Christianity is about service, sacrifice, and surrender.',
      'When you have Christ, you have everything. Without Christ, you have nothing.',
      'Your past is not your future unless you live there.',
      'Do not be afraid of suffering. Suffering is a teacher.',
      'Miracles happen where there is expectation and faith.',
      'You can never separate love from service.',
      'The greatest miracle is not healing the body. It is transformation of the heart.',
      'Prayer changes things because prayer changes people who change things.',
    ],
  },
};
