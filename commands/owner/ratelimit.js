/**
 * ⚡ NovaSpark Bot v10 — Advanced Rate Limiting
 * Per-user intelligent rate limiting with cooldowns and bypass
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');
const config = require('../../config');

// In-memory rate limit tracker
const userLimits = new Map();
const WINDOW_MS = 60000; // 1 minute window
const DEFAULT_LIMIT = 15; // commands per minute
const PREMIUM_LIMIT = 30;
const COOLDOWN_MS = 30000; // 30 second cooldown when hit

function getUserLimit(userId) {
  if (!userLimits.has(userId)) {
    userLimits.set(userId, { timestamps: [], cooldownUntil: 0, warnings: 0 });
  }
  return userLimits.get(userId);
}

function isRateLimited(userId, isPremium = false) {
  const limit = getUserLimit(userId);
  const now = Date.now();

  // Check cooldown
  if (limit.cooldownUntil > now) {
    return { limited: true, remaining: Math.ceil((limit.cooldownUntil - now) / 1000), reason: 'cooldown' };
  }

  // Clean old timestamps
  limit.timestamps = limit.timestamps.filter(t => now - t < WINDOW_MS);

  const maxLimit = isPremium ? PREMIUM_LIMIT : DEFAULT_LIMIT;

  if (limit.timestamps.length >= maxLimit) {
    limit.cooldownUntil = now + COOLDOWN_MS;
    limit.warnings++;
    return { limited: true, remaining: Math.ceil(COOLDOWN_MS / 1000), reason: 'limit' };
  }

  limit.timestamps.push(now);
  return { limited: false, remaining: maxLimit - limit.timestamps.length };
}

function resetUserLimit(userId) {
  userLimits.delete(userId);
}

module.exports = {
  name: 'ratelimit',
  aliases: ['rl', 'limits', 'cooldown'],
  category: 'owner',
  description: 'Configure per-user rate limiting',
  usage: '.ratelimit <status|set|reset|whitelist>',
  ownerOnly: true,

  isRateLimited,
  resetUserLimit,

  async execute({ sock, msg, from, args, reply }) {
    const sub = (args[0] || 'status').toLowerCase();

    switch (sub) {
      case 'status': {
        const enabled = database.getSetting('rateLimitEnabled') !== false;
        const limit = database.getSetting('rateLimitMax') || DEFAULT_LIMIT;
        return reply(`⏱️ *Rate Limiter*\n\nStatus: ${enabled ? '✅ ON' : '❌ OFF'}\nLimit: ${limit} commands/minute\nPremium: ${PREMIUM_LIMIT} commands/minute\nCooldown: ${COOLDOWN_MS / 1000}s\n\n*Commands:*\n• \`.ratelimit on/off\`\n• \`.ratelimit set <number>\`\n• \`.ratelimit reset <number>\`\n• \`.ratelimit whitelist <number>\``);
      }

      case 'on': case 'enable': {
        database.setSetting('rateLimitEnabled', true);
        return reply('⏱️ Rate limiting enabled.');
      }

      case 'off': case 'disable': {
        database.setSetting('rateLimitEnabled', false);
        return reply('⏱️ Rate limiting disabled.');
      }

      case 'set': {
        const num = parseInt(args[1]);
        if (!num || num < 1 || num > 100) return reply('❌ Limit must be 1-100.');
        database.setSetting('rateLimitMax', num);
        return reply(`⏱️ Rate limit set to ${num} commands/minute.`);
      }

      case 'reset': {
        const target = args[1];
        if (!target) {
          userLimits.clear();
          return reply('⏱️ All rate limits reset.');
        }
        const jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
        resetUserLimit(jid);
        return reply(`⏱️ Rate limit reset for ${target}.`);
      }

      case 'whitelist': case 'wl': {
        const target = args[1];
        if (!target) {
          const wl = database.getSetting('rateLimitWhitelist') || [];
          if (!wl.length) return reply('⏱️ No whitelisted users.');
          return reply(`⏱️ *Whitelisted:*\n${wl.map(n => `• ${n}`).join('\n')}`);
        }
        const wl = database.getSetting('rateLimitWhitelist') || [];
        const jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
        if (wl.includes(jid)) {
          database.setSetting('rateLimitWhitelist', wl.filter(w => w !== jid));
          return reply(`⏱️ Removed ${target} from whitelist.`);
        }
        wl.push(jid);
        database.setSetting('rateLimitWhitelist', wl);
        return reply(`⏱️ Added ${target} to whitelist (no rate limits).`);
      }

      default:
        return reply('⏱️ Usage: `.ratelimit <status|on|off|set|reset|whitelist>`');
    }
  },

  // Check function for handler.js
  check(userId) {
    if (database.getSetting('rateLimitEnabled') === false) return { limited: false };
    const wl = database.getSetting('rateLimitWhitelist') || [];
    if (wl.includes(userId)) return { limited: false };
    const isPrem = database.isPremium?.(userId) || false;
    return isRateLimited(userId, isPrem);
  },
};
