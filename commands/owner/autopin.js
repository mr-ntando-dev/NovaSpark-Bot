/**
 * ⚡ NovaSpark Bot v8.0 — Auto Pin Command
 * .autopin on/off — Auto-pin every admin message in a group
 * .autopin msg — Pin a specific replied message
 * .autopin keyword <word> — Auto-pin messages containing a keyword
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'autopin',
  aliases: ['pin', 'pinmsg'],
  description: 'Auto-pin admin messages or pin by keyword',
  category: 'owner',
  ownerOnly: false,

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      database.updateGroupSettings(from, { autoPin: true });
      return reply('📌 *Auto Pin: ON*\n\nEvery admin message will be auto-pinned.');
    }

    if (sub === 'off') {
      database.updateGroupSettings(from, { autoPin: false });
      return reply('📌 *Auto Pin: OFF*');
    }

    if (sub === 'msg') {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      if (!quoted || !quotedId) return reply('↩️ Reply to a message to pin it.');
      try {
        await sock.sendMessage(from, {
          pin: { type: 1, time: 604800 }, // 7 days
        }, { quoted: { key: { id: quotedId, remoteJid: from } } });
        return reply('📌 Message pinned for 7 days!');
      } catch {
        return reply('❌ Could not pin — make sure I am an admin.');
      }
    }

    if (sub === 'keyword') {
      const kw = args.slice(1).join(' ').toLowerCase();
      if (!kw) return reply('❌ Provide a keyword. E.g. `.autopin keyword announcement`');
      const gs = database.getGroupSettings(from);
      const keywords = gs.pinKeywords || [];
      keywords.push(kw);
      database.updateGroupSettings(from, { pinKeywords: keywords });
      return reply(`📌 *Auto-pin keyword added:* "${kw}"\n\nAny message containing this word will be pinned.`);
    }

    if (sub === 'clearkw') {
      database.updateGroupSettings(from, { pinKeywords: [] });
      return reply('🗑️ All pin keywords cleared.');
    }

    const gs = database.getGroupSettings(from);
    return reply(
      '📌 *Auto Pin*\n\n' +
      `Status: *${gs.autoPin ? 'ON ✅' : 'OFF ❌'}*\n` +
      `Pin Keywords: ${(gs.pinKeywords || []).map(k => `"${k}"`).join(', ') || 'None'}\n\n` +
      '`.autopin on/off` — Toggle auto-pin\n' +
      '`.autopin msg` — Pin a replied message\n' +
      '`.autopin keyword <word>` — Add pin keyword\n' +
      '`.autopin clearkw` — Clear all keywords'
    );
  },
};
