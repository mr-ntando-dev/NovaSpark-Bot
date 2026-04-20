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
  // On Render the persistent disk is mounted at /opt/render/project/src/session
  // Locally (dev) it falls back to the plain "session" folder
  sessionName: process.env.SESSION_DIR || 'session',
  sessionID:   process.env.SESSION_ID || 'KnightBot!H4sIAAAAAAAAA5VU25KiSBD9l3rVGLkJYkRHLCACKngBrxvzUEIBpdysKhWZ6H/fwO7e7ofd2d63qqwkz8mTh/wFihJTNEUPMPwFKoJvkKH2yB4VAkOgX+MYEdAFEWQQDMF6YugJtRLIVR4fMW+cnz0/VuUm1yuBBl7hNeJZHyh7S3oBr11QXY8ZDn9T8LCVlN51YxW9U4CORA966dLtjAxfXVwVeHOW3HzuiFoVcm3BtiLEBBeJWaUoRwRmU/RYQEy+R38wpXQ/Pq5C3tGdpRK79611nO8Ndx64uD43k/B6KRiPgtz9Hv3G24ajcqKc68UJzvNlsdXRjJ8HfbbjUm+F7zE+nNTHrFef3+hTnBQociJUMMwe39Z9bjfT0B/ZB0t28ss6spsLR8wg6Bn8bExNvC1pLnCDeipw3yMeX4+1nQwuo1qOcartdGu3N++7ibC4e/lyqzWaaJA6pomZfCW+IB9eOf8f3edOfBA9YlYhPXcoj/kV0SvbOotjtxGsWznoWM4FOv5ju/4e/e3+1qhymZ4PhahFKRXMJWNQHmgnfrfJ+7d9Rx4no2hvCs4nfciu5Hcs95JrWoIeOkfSmyqLdUM2x0qZicIqous0XWfhYaN6naQhWb8yHCZZiUvzkrh4OkKbYxNsbe+R2j3KC/nWlQfegeyM5cuzozN6OBEY8q9dQFCCKSOQ4bJ4xvpCF8Do5qOQIPaUF/T9TMmC3aq0C1tDaHWEXO8klVGyy9duHnbG5myyPIyQJIcvoAsqUoaIUhTZmLKSPFxEKUwQBcM/f3ZBgWr2NrgWTuS7IMaEsnVxrbISRh9T/XiEYVheC+Y/itBoD4iAIfcZRozhIqGtjtcCkjDFN2SkkFEwjGFG0d8dIoKi91gXkPLafuYUcfmbCRja2dGXid8q9o7XZkeIQZzRNsEx8ttUG5nTTpnRgWVpZqIZiQY++X0M+k3IQDxfbdU+iArLeVSX4qOX2vsmCx/camHj3eTeRKV2v2iB8/IPRdoNVV0ndz9U5rtDbGyzeXGW174UjWzNkGmKHW2i0+iYX31PWN5pJcSwIjclmVedUzDHli9pxqKpfUMN09PlYNSb20zT7i8tWoRuOERfwTZ8clka3M1dmFW9Rqt0mZ72tt0/NRyV++Gx0FVhz6IojD2CitlFLte+ozebzriUNvm0PoojV3B2/tGdYNV1eF6aqkbyZsH86X0cgSEQZFFRFF6QVHUwFIQ/6I97O0FYVT8KxEAXZM80XuIUWVQVVRYkmRPbzPbh43fK3tcYfhqtLd1eY4yeW6GALeB/Q72J0JqPe+1+qfG+Z/7FKfpa7c/S3kqIOsqB7Sj0BjdpJbj9ncvMoJayR+iKUHOnifkAr68/u6DKIItLkoMhgEVEShy1fULKtE+/BzhHlMG8AkNeUWS5L4qy+voXMcfJwiUHAAA=',
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
