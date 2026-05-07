/**
 * ⚡ NovaSpark v4 — Anti-Word (Custom Bad Word Filter)
 * .antiword on/off | .antiword add word | .antiword remove word | .antiword list
 * Per-group custom bad word list — unique feature.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const config   = require('../../config');

module.exports = {
  name: 'antiword',
  aliases: ['wordfilter', 'filterword'],
  description: 'Custom bad word filter with per-group word lists',
  category: 'group',
  adminOnly: true,

  execute: async ({ sock, msg, from, args, reply, isAdmin, isBotAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub  = (args[0] || '').toLowerCase();
    const word = args.slice(1).join(' ').toLowerCase().trim();
    const gs   = database.getGroupSettings(from);
    const list = gs.badWords || [];

    if (sub === 'on') {
      database.updateGroupSettings(from, { antiword: true });
      return reply('🔤 *Anti-Word: ON* ✅\nBanned words will be deleted automatically.');
    }
    if (sub === 'off') {
      database.updateGroupSettings(from, { antiword: false });
      return reply('🔤 *Anti-Word: OFF*');
    }
    if (sub === 'add') {
      if (!word) return reply('Usage: `.antiword add <word>`');
      if (list.includes(word)) return reply(`"${word}" is already in the list.`);
      const newList = [...list, word];
      database.updateGroupSettings(from, { badWords: newList });
      return reply(`✅ Added "*${word}*" to bad word list. (${newList.length} words total)`);
    }
    if (sub === 'remove') {
      if (!word) return reply('Usage: `.antiword remove <word>`');
      const newList = list.filter(w => w !== word);
      database.updateGroupSettings(from, { badWords: newList });
      return reply(`✅ Removed "*${word}*" from bad word list.`);
    }
    if (sub === 'list') {
      if (!list.length) return reply('🔤 No banned words yet. Use `.antiword add <word>`');
      return reply(
        `🔤 *Banned Words* (${list.length})\n\n` +
        list.map((w, i) => `${i + 1}. ||${w}||`).join('\n') +
        `\n\n_Status: ${gs.antiword ? 'ON ✅' : 'OFF ❌'}_`
      );
    }
    if (sub === 'clear') {
      database.updateGroupSettings(from, { badWords: [] });
      return reply('🔤 Bad word list cleared.');
    }

    return reply(
      '🔤 *Anti-Word Filter*\n\n' +
      '`.antiword on/off` — Toggle filter\n' +
      '`.antiword add word` — Add banned word\n' +
      '`.antiword remove word` — Remove word\n' +
      '`.antiword list` — Show banned words\n' +
      '`.antiword clear` — Clear all words'
    );
  },

  // Called by handler.js on each message
  check: async (sock, msg, from, groupSettings) => {
    if (!groupSettings.antiword) return false;
    const list = groupSettings.badWords || [];
    if (!list.length) return false;
    const text = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''
    ).toLowerCase();
    if (!text || text.startsWith(config.prefix)) return false;
    const found = list.find(w => text.includes(w));
    if (!found) return false;
    try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
    const sender = msg.key.participant || msg.key.remoteJid;
    await sock.sendMessage(from, {
      text: `🔤 *Anti-Word Alert*\n@${sender.split('@')[0]} — Banned word detected. Message deleted.`,
      mentions: [sender],
    });
    return true;
  },
};
