/**
 * ⚡ NovaSpark Bot v10 — Auto Bio (TB Joshua Quotes)
 * .autobio on/off        — Toggle auto bio update
 * .autobio interval <min> — Set update interval in minutes
 * .autobio now           — Update bio right now
 * Automatically rotates bot's WhatsApp bio/about with TB Joshua quotes
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const config   = require('../../config');

// ── TB Joshua Quotes for Bio ──────────────────────────────────────────────────
const TBJ_BIO_QUOTES = [
  '🙏 Prayer is the master key — TB Joshua',
  '✝️ Faith over fear. God is in control — TBJ',
  '⭐ Destiny is a matter of choice — TB Joshua',
  '💛 Forgiveness is not weakness, it is strength — TBJ',
  '🔥 The greatest battle is in the mind — TB Joshua',
  '🌅 Every new day is a gift from God — TBJ',
  '✨ Miracles happen where there is faith — TB Joshua',
  '📖 Where there is no vision, people perish — TBJ',
  '🙏 Prayer changes people who change things — TB Joshua',
  '💪 Your past is not your future — TBJ',
  '🌱 Yesterday is gone. Today is a gift — TB Joshua',
  '❤️ You can never separate love from service — TBJ',
  '⛪ Real Christianity is service & sacrifice — TB Joshua',
  '🛡️ Counter fear with faith — TB Joshua',
  '✝️ With Christ you have everything — TBJ',
  '🔥 Do not be afraid of suffering — TB Joshua',
  '💯 The enemy is doubt, unbelief & hatred — TBJ',
  '⚡ When God is about to bless, He starts with difficulty — TBJ',
  '🙏 Your test is blessing others in your storm — TB Joshua',
  '🌟 The greatest miracle is transformation of the heart — TBJ',
];

let _bioInterval = null;

function getRandomBioQuote() {
  return TBJ_BIO_QUOTES[Math.floor(Math.random() * TBJ_BIO_QUOTES.length)];
}

function getDailyBioQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return TBJ_BIO_QUOTES[day % TBJ_BIO_QUOTES.length];
}

async function updateBio(sock) {
  try {
    const mode = database.getGlobalSetting ? database.getGlobalSetting('autoBioMode') : 'daily';
    const quote = mode === 'random' ? getRandomBioQuote() : getDailyBioQuote();
    await sock.updateProfileStatus(quote);
    return quote;
  } catch (e) {
    return null;
  }
}

function startAutoBioLoop(sock) {
  if (_bioInterval) clearInterval(_bioInterval);
  const enabled = database.getGlobalSetting ? database.getGlobalSetting('autoBio') : false;
  if (!enabled) return;

  const mins = database.getGlobalSetting ? (database.getGlobalSetting('autoBioInterval') || 60) : 60;
  // Update immediately on start
  updateBio(sock);
  // Then every N minutes
  _bioInterval = setInterval(() => updateBio(sock), mins * 60 * 1000);
}

function stopAutoBioLoop() {
  if (_bioInterval) { clearInterval(_bioInterval); _bioInterval = null; }
}

module.exports = {
  name: 'autobio',
  aliases: ['autoboi', 'tbjbio', 'bioquote'],
  description: 'Auto-update bot bio with TB Joshua quotes',
  category: 'owner',
  ownerOnly: true,

  // Exported for index.js startup
  startAutoBioLoop,
  stopAutoBioLoop,
  updateBio,

  execute: async ({ sock, msg, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoBio', true);
      startAutoBioLoop(sock);
      const quote = await updateBio(sock);
      return reply(
        '✝️ *Auto Bio (TB Joshua Quotes): ON*\n\n' +
        `Current bio: _"${quote || 'Updating...'}"_\n\n` +
        'Your WhatsApp bio will auto-update with TBJ quotes.\n' +
        '_Use `.autobio interval <min>` to change frequency._'
      );
    }
    if (sub === 'off') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoBio', false);
      stopAutoBioLoop();
      return reply('✝️ *Auto Bio: OFF*');
    }
    if (sub === 'now') {
      const quote = await updateBio(sock);
      return reply(quote ? `✅ Bio updated: _"${quote}"_` : '❌ Failed to update bio.');
    }
    if (sub === 'interval') {
      const mins = parseInt(args[1]);
      if (!mins || mins < 5) return reply('❌ Minimum interval is 5 minutes.\nUsage: `.autobio interval 60`');
      if (database.setGlobalSetting) database.setGlobalSetting('autoBioInterval', mins);
      // Restart loop with new interval
      const enabled = database.getGlobalSetting ? database.getGlobalSetting('autoBio') : false;
      if (enabled) startAutoBioLoop(sock);
      return reply(`✅ Bio will update every *${mins} minutes*.`);
    }
    if (sub === 'mode') {
      const mode = (args[1] || '').toLowerCase();
      if (!['daily', 'random'].includes(mode)) return reply('Usage: `.autobio mode daily` or `.autobio mode random`');
      if (database.setGlobalSetting) database.setGlobalSetting('autoBioMode', mode);
      return reply(`✅ Bio mode set to *${mode}*.`);
    }

    const isOn = database.getGlobalSetting ? database.getGlobalSetting('autoBio') : false;
    const mins = database.getGlobalSetting ? (database.getGlobalSetting('autoBioInterval') || 60) : 60;
    const mode = database.getGlobalSetting ? (database.getGlobalSetting('autoBioMode') || 'daily') : 'daily';
    return reply(
      '✝️ *Auto Bio — TB Joshua Quotes*\n\n' +
      `Status: *${isOn ? 'ON ✅' : 'OFF ❌'}*\n` +
      `Interval: Every *${mins} minutes*\n` +
      `Mode: *${mode}*\n\n` +
      '`.autobio on/off` — Toggle\n' +
      '`.autobio now` — Update bio now\n' +
      '`.autobio interval 30` — Change interval\n' +
      '`.autobio mode daily/random` — Change rotation mode'
    );
  },
};
