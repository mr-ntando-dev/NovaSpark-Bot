/**
 * ⚡ NovaSpark Bot v8.0 — Stealth Mode (Enhanced Ghost)
 * .stealth on          — Maximum stealth: no online, no typing, no receipts, 
 *                        random response delay, fake "last seen" management
 * .stealth off         — Disable all stealth
 * .stealth status      — Show current stealth config
 * .stealth delay <ms>  — Set random response delay range
 * .stealth presence offline/available/unavailable
 * This is MUCH deeper than basic ghost mode
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// Global stealth state
let stealthConfig = {
  enabled: false,
  noOnline: true,
  noTyping: true,
  noReadReceipts: true,
  randomDelay: true,
  minDelay: 500,
  maxDelay: 3000,
  presenceMode: 'unavailable',
};

function getDelay() {
  if (!stealthConfig.randomDelay) return 0;
  return Math.floor(Math.random() * (stealthConfig.maxDelay - stealthConfig.minDelay)) + stealthConfig.minDelay;
}

module.exports = {
  name: 'stealth',
  aliases: ['stealthmode', 'stealthinvis', 'darkmode'],
  description: 'Maximum stealth mode — bot hides completely from detection',
  category: 'owner',
  ownerOnly: true,

  // Export stealth config for use by handler.js
  getStealthConfig: () => stealthConfig,
  getDelay,

  onStartup: async (sock) => {
    // Restore stealth state from database
    const saved = database.getGlobalSetting ? database.getGlobalSetting('stealthConfig') : null;
    if (saved) Object.assign(stealthConfig, saved);

    if (stealthConfig.enabled) {
      // Apply presence suppression
      try {
        await sock.sendPresenceUpdate(stealthConfig.presenceMode === 'offline' ? 'unavailable' : stealthConfig.presenceMode);
      } catch {}
    }
  },

  execute: async ({ sock, msg, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      stealthConfig.enabled = true;
      if (database.setGlobalSetting) database.setGlobalSetting('stealthConfig', stealthConfig);
      try { await sock.sendPresenceUpdate('unavailable'); } catch {}
      return reply(
        '🥷 *Stealth Mode: MAXIMUM*\n\n' +
        '• ❌ No online indicator\n' +
        '• ❌ No typing indicator\n' +
        '• ❌ No read receipts\n' +
        '• ⏱️ Random response delay (0.5–3s)\n' +
        '• 👻 Presence set to unavailable\n\n' +
        '_I am now completely invisible. Nobody knows I exist._\n\n' +
        '_WhatsApp will show me as "last seen a long time ago"._'
      );
    }

    if (sub === 'off') {
      stealthConfig.enabled = false;
      if (database.setGlobalSetting) database.setGlobalSetting('stealthConfig', stealthConfig);
      try { await sock.sendPresenceUpdate('available'); } catch {}
      return reply('👁️ *Stealth Mode: OFF* — Bot is now visible and normal.');
    }

    if (sub === 'delay') {
      const ms = parseInt(args[1]);
      const ms2 = parseInt(args[2]);
      if (isNaN(ms)) return reply('❌ Usage: `.stealth delay <minMs> [maxMs]`\nExample: `.stealth delay 500 2000`');
      stealthConfig.minDelay = ms;
      stealthConfig.maxDelay = ms2 || ms * 3;
      if (database.setGlobalSetting) database.setGlobalSetting('stealthConfig', stealthConfig);
      return reply(`⏱️ Response delay set: *${ms}ms – ${stealthConfig.maxDelay}ms* (random per message)`);
    }

    if (sub === 'presence') {
      const mode = args[1] || 'unavailable';
      if (!['available', 'unavailable', 'composing', 'recording', 'paused'].includes(mode)) {
        return reply('❌ Valid modes: `available`, `unavailable`, `composing`, `recording`, `paused`');
      }
      stealthConfig.presenceMode = mode;
      if (database.setGlobalSetting) database.setGlobalSetting('stealthConfig', stealthConfig);
      try { await sock.sendPresenceUpdate(mode); } catch {}
      return reply(`👻 Presence set to: *${mode}*`);
    }

    if (sub === 'noread') {
      stealthConfig.noReadReceipts = args[1] !== 'off';
      if (database.setGlobalSetting) database.setGlobalSetting('stealthConfig', stealthConfig);
      return reply(`👁️ Read receipts suppression: *${stealthConfig.noReadReceipts ? 'ON' : 'OFF'}*`);
    }

    return reply(
      '🥷 *Stealth Mode Config*\n\n' +
      `Status: *${stealthConfig.enabled ? 'ACTIVE 🔴' : 'OFF ⚪'}*\n` +
      `No Online: *${stealthConfig.noOnline ? '✅' : '❌'}*\n` +
      `No Typing: *${stealthConfig.noTyping ? '✅' : '❌'}*\n` +
      `No Read Receipts: *${stealthConfig.noReadReceipts ? '✅' : '❌'}*\n` +
      `Random Delay: *${stealthConfig.minDelay}–${stealthConfig.maxDelay}ms*\n` +
      `Presence: *${stealthConfig.presenceMode}*\n\n` +
      '`.stealth on` — Enable all stealth\n' +
      '`.stealth off` — Disable\n' +
      '`.stealth delay <min> <max>` — Set response delay\n' +
      '`.stealth presence <mode>` — Set presence mode\n' +
      '`.stealth noread on/off` — Toggle read receipts\n\n' +
      '_💡 Combine with `.ghost on` for maximum invisibility_'
    );
  },
};
