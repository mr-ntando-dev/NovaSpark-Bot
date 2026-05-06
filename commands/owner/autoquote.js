/**
 * ⚡ NovaSpark Bot v8.0 — Auto Quote Reply
 * .autoquote on/off        — Bot auto-quotes+replies to certain trigger words
 * .autoquote add <word> <reply>   — Add a quote-reply trigger
 * .autoquote list          — List all triggers
 * .autoquote remove <word> — Remove a trigger
 * Quotes the user's message and replies - looks like a human moderator
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const DEFAULT_TRIGGERS = [
  { word: 'help', reply: '💡 Need help? Type *.menu* for all commands!' },
  { word: 'admin', reply: '📣 Admins have been notified. Please wait.' },
  { word: 'rules', reply: '📜 Please check the group description for our rules.' },
  { word: 'link', reply: '🔗 No links allowed here! Use .menu for bot commands.' },
  { word: 'pin', reply: '📌 Check the pinned messages for important info.' },
];

module.exports = {
  name: 'autoquote',
  aliases: ['quotereply', 'aqr'],
  description: 'Auto quote-reply to trigger words like a human moderator',
  category: 'owner',
  ownerOnly: false,

  onMessage: async ({ sock, msg, from, text, sender }) => {
    if (!text || !from.endsWith('@g.us')) return;
    const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
    if (!gs.autoQuoteReply) return;

    const lowerText = text.toLowerCase().trim();
    const triggers = gs.quoteTriggers || DEFAULT_TRIGGERS;

    for (const t of triggers) {
      if (lowerText.includes(t.word.toLowerCase())) {
        await sock.sendMessage(from, { text: t.reply }, { quoted: msg });
        break; // only one reply per message
      }
    }
  },

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      database.updateGroupSettings(from, { autoQuoteReply: true });
      return reply('💬 *Auto Quote Reply: ON*\n\nI will now quote-reply to trigger words like a human moderator.');
    }
    if (sub === 'off') {
      database.updateGroupSettings(from, { autoQuoteReply: false });
      return reply('💬 *Auto Quote Reply: OFF*');
    }
    if (sub === 'add') {
      const word = args[1];
      const replyText = args.slice(2).join(' ');
      if (!word || !replyText) return reply('❌ Usage: `.autoquote add <word> <reply text>`');
      const gs = database.getGroupSettings(from);
      const triggers = gs.quoteTriggers || [...DEFAULT_TRIGGERS];
      triggers.push({ word, reply: replyText });
      database.updateGroupSettings(from, { quoteTriggers: triggers });
      return reply(`✅ *Trigger added:*\nWord: "${word}"\nReply: ${replyText}`);
    }
    if (sub === 'remove') {
      const word = args[1];
      if (!word) return reply('❌ Provide the trigger word to remove.');
      const gs = database.getGroupSettings(from);
      const triggers = (gs.quoteTriggers || DEFAULT_TRIGGERS).filter(t => t.word.toLowerCase() !== word.toLowerCase());
      database.updateGroupSettings(from, { quoteTriggers: triggers });
      return reply(`🗑️ Trigger "${word}" removed.`);
    }
    if (sub === 'list') {
      const gs = database.getGroupSettings(from);
      const triggers = gs.quoteTriggers || DEFAULT_TRIGGERS;
      const lines = triggers.map((t, i) => `${i+1}. *"${t.word}"* → ${t.reply}`).join('\n\n');
      return reply(`💬 *Auto Quote Triggers*\n\n${lines}`);
    }
    if (sub === 'reset') {
      database.updateGroupSettings(from, { quoteTriggers: DEFAULT_TRIGGERS });
      return reply('🔄 Triggers reset to defaults.');
    }

    const gs = database.getGroupSettings(from);
    return reply(
      '💬 *Auto Quote Reply*\n\n' +
      `Status: *${gs.autoQuoteReply ? 'ON ✅' : 'OFF ❌'}*\n\n` +
      '`.autoquote on/off` — Toggle\n' +
      '`.autoquote add <word> <reply>` — Add trigger\n' +
      '`.autoquote remove <word>` — Remove trigger\n' +
      '`.autoquote list` — View triggers\n' +
      '`.autoquote reset` — Reset to defaults'
    );
  },
};
