/**
 * ⚡ NovaSpark Bot v11 — .bulkdelete
 * Delete the last N messages sent by the bot in a group.
 * Owner/admin only. Useful for clearing spam, test messages, or announcements.
 * By Dev-Ntando
 */
'use strict';
const config   = require('../../config');
const database = require('../../database');

// ── Per-chat message cache (stores bot's own sent message keys) ───────────────
// We hook into the message send pipeline via a simple ring buffer per JID.
const _botMsgCache = new Map(); // jid => Array<{ key, ts }>
const MAX_CACHE    = 100;

/**
 * Call this from your send wrappers OR use the exported cacheBotMsg() below.
 * The handler.js sends via sock.sendMessage — we can't intercept that easily,
 * so we store keys after-the-fact when bulkdelete detects fromMe messages.
 */
function cacheBotMsg(jid, key) {
  if (!_botMsgCache.has(jid)) _botMsgCache.set(jid, []);
  const arr = _botMsgCache.get(jid);
  arr.push({ key, ts: Date.now() });
  if (arr.length > MAX_CACHE) arr.shift();
}

// ── Export the cache function so index.js / handler can call it ───────────────
module.exports.cacheBotMsg = cacheBotMsg;

module.exports = {
  name:        'bulkdelete',
  aliases:     ['clearmsg', 'purgechat', 'delbulk', 'clearbot'],
  category:    'owner',
  description: 'Delete the last N bot messages from this chat (owner/admin only)',
  usage:       '.bulkdelete <number>  (max 50)',
  adminOnly:   true,

  execute: async ({ sock, msg, from, args, reply, isAdmin, sender }) => {
    const n = parseInt(args[0]);
    if (!n || n < 1 || n > 50) {
      return reply([
        '🗑️ *Bulk Delete*',
        '',
        'Delete the last N messages this bot sent in this chat.',
        '',
        '*Usage:* `.bulkdelete <1–50>`',
        '*Example:* `.bulkdelete 10`',
        '',
        '_Only works for messages sent during this session._',
      ].join('\n'));
    }

    const cache = _botMsgCache.get(from) || [];
    if (!cache.length) {
      return reply('⚠️ No bot messages cached for this chat in the current session.\n\nThe bot can only delete messages it sent after the last restart.');
    }

    // Take the last n from cache (most recent)
    const targets = cache.slice(-n).reverse();
    let deleted = 0;
    let failed  = 0;

    await reply(`🗑️ Deleting last *${Math.min(n, targets.length)}* bot message(s)...`);

    for (const { key } of targets) {
      try {
        await sock.sendMessage(from, { delete: key });
        deleted++;
        await new Promise(r => setTimeout(r, 350)); // anti-rate-limit
      } catch {
        failed++;
      }
    }

    // Remove deleted keys from cache
    const deletedKeys = new Set(targets.map(t => t.key.id));
    const remaining   = cache.filter(c => !deletedKeys.has(c.key.id));
    _botMsgCache.set(from, remaining);

    return reply(
      `✅ *Bulk Delete Complete*\n` +
      `🗑️ Deleted: ${deleted}\n` +
      (failed ? `⚠️ Failed: ${failed}\n` : '') +
      `_Requires bot to be admin to delete others' messages._`
    );
  },
};
