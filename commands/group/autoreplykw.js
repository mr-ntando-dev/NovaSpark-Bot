/**
 * ⚡ NovaSpark Bot — Auto-Reply Keywords
 * Set custom keyword → auto-reply pairs per group (or globally).
 * .autoreply add <keyword> | <reply text>
 * .autoreply remove <keyword>
 * .autoreply list
 * .autoreply off / on
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const DB_KEY = 'autoreplyKeywords';

function getKeywords(gid) {
  const all = database.getSetting(DB_KEY) || {};
  return all[gid] || [];
}

function saveKeywords(gid, kws) {
  const all = database.getSetting(DB_KEY) || {};
  all[gid]  = kws;
  database.setSetting(DB_KEY, all);
}

// Called from handler for every non-command message in a group
async function check(sock, msg, from, body) {
  const settings = database.getGroupSettings(from);
  if (settings.autoreplyOff) return false;
  const kws = getKeywords(from);
  if (!kws.length) return false;

  const lowerBody = body.toLowerCase();
  for (const { keyword, response } of kws) {
    if (lowerBody.includes(keyword.toLowerCase())) {
      await sock.sendMessage(from, { text: response }, { quoted: msg });
      return true;
    }
  }
  return false;
}

module.exports = {
  name: 'autoreply',
  aliases: ['autoreplykw', 'keyword', 'kw'],
  adminOnly: true,
  groupOnly: true,
  category: 'group',
  description: 'Set keyword → auto-reply pairs for this group',
  usage: '.autoreply add <keyword> | <reply> | remove <kw> | list | on | off',

  check,

  async execute({ from, args, reply, isAdmin }) {
    if (!isAdmin) return reply('🔒 Only admins can manage auto-reply keywords.');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'add') {
      const full = args.slice(1).join(' ');
      const sep  = full.indexOf('|');
      if (sep === -1) return reply('⚠️ Usage: `.autoreply add <keyword> | <reply text>`');
      const keyword  = full.slice(0, sep).trim().toLowerCase();
      const response = full.slice(sep + 1).trim();
      if (!keyword || !response) return reply('⚠️ Both keyword and reply text are required.');
      const kws = getKeywords(from).filter(k => k.keyword !== keyword);
      kws.push({ keyword, response });
      saveKeywords(from, kws);
      return reply(`✅ Auto-reply added!\n\n🔑 Keyword: *${keyword}*\n💬 Reply: ${response}`);
    }

    if (sub === 'remove') {
      const keyword = args.slice(1).join(' ').trim().toLowerCase();
      const kws     = getKeywords(from).filter(k => k.keyword !== keyword);
      saveKeywords(from, kws);
      return reply(`🗑️ Removed auto-reply for: *${keyword}*`);
    }

    if (sub === 'list') {
      const kws = getKeywords(from);
      if (!kws.length) return reply('📋 No auto-reply keywords set for this group.');
      const list = kws.map((k, i) => `${i + 1}. *${k.keyword}* → ${k.response}`).join('\n');
      return reply(`📋 *Auto-Reply Keywords*\n\n${list}`);
    }

    if (sub === 'on') {
      database.updateGroupSettings(from, { autoreplyOff: false });
      return reply('✅ Auto-reply keywords *enabled*');
    }

    if (sub === 'off') {
      database.updateGroupSettings(from, { autoreplyOff: true });
      return reply('🔴 Auto-reply keywords *disabled*');
    }

    const kws = getKeywords(from);
    return reply(
      `🤖 *Auto-Reply Keywords*\n\n` +
      `Active: ${kws.length} keyword${kws.length !== 1 ? 's' : ''}\n\n` +
      `_.autoreply add <keyword> | <reply>_\n` +
      `_.autoreply remove <keyword>_\n` +
      `_.autoreply list_\n` +
      `_.autoreply on / off_`
    );
  },
};
