/**
 * ⚡ NovaSpark Bot v7 — AntiBadWord (enhanced)
 * Blocks offensive/profane words in groups
 * Supports custom word lists per group + default global list
 * Auto-starts per group when enabled
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// Default bad word list (extend as needed)
const DEFAULT_BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn you',
  'motherfucker', 'cunt', 'whore', 'slut', 'faggot', 'nigger',
  'kaffir', 'retard', 'idiot go die', 'kill yourself',
];

function containsBadWord(text, wordList) {
  const lower = text.toLowerCase();
  return wordList.find(w => lower.includes(w.toLowerCase())) || null;
}

module.exports = {
  name: 'antibadword',
  aliases: ['badword', 'antiswear'],
  category: 'group',
  description: 'Block offensive/bad words in group',
  usage: '.antibadword on | off | add <word> | remove <word> | list | set <delete|warn|kick> | get',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply }) {
    try {
      const opt  = (args[0] || '').toLowerCase();
      const s    = database.getGroupSettings(from);
      const list = s.badWordList || [];

      if (!opt || opt === 'get') {
        return reply(
          `🤬 *AntiBadWord — NovaSpark*\n\n` +
          `Status      : *${s.antibadword ? '🟢 ON' : '🔴 OFF'}*\n` +
          `Action      : *${s.antibadwordAction || 'delete'}*\n` +
          `Custom words: *${list.length}* added\n\n` +
          `  .antibadword on / off\n` +
          `  .antibadword add <word>\n` +
          `  .antibadword remove <word>\n` +
          `  .antibadword list\n` +
          `  .antibadword set delete | warn | kick`
        );
      }
      if (opt === 'on') {
        database.updateGroupSettings(from, { antibadword: true });
        return reply('🤬 *AntiBadWord is ON* — offensive language will be blocked.');
      }
      if (opt === 'off') {
        database.updateGroupSettings(from, { antibadword: false });
        return reply('🤬 *AntiBadWord is OFF*.');
      }
      if (opt === 'set') {
        const action = (args[1] || '').toLowerCase();
        if (!['delete', 'warn', 'kick'].includes(action)) {
          return reply('❌ Valid actions: *delete* | *warn* | *kick*');
        }
        database.updateGroupSettings(from, { antibadword: true, antibadwordAction: action });
        return reply(`🤬 *AntiBadWord action set to* \`${action}\`.`);
      }
      if (opt === 'add') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        if (!word) return reply('❌ Provide a word to add.');
        if (list.includes(word)) return reply(`⚠️ "*${word}*" is already in the list.`);
        list.push(word);
        database.updateGroupSettings(from, { badWordList: list });
        return reply(`✅ "*${word}*" added to bad word list.`);
      }
      if (opt === 'remove') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        const idx  = list.indexOf(word);
        if (idx === -1) return reply(`⚠️ "*${word}*" not found in the list.`);
        list.splice(idx, 1);
        database.updateGroupSettings(from, { badWordList: list });
        return reply(`✅ "*${word}*" removed from bad word list.`);
      }
      if (opt === 'list') {
        const all = [...DEFAULT_BAD_WORDS.map(w => `• ${w} _(default)_`), ...list.map(w => `• ${w} _(custom)_`)];
        return reply(`🤬 *Bad Word List*\n\n${all.join('\n')}`);
      }
      return reply('❓ Usage: `.antibadword on | off | add <word> | remove <word> | list | set <action>`');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },

  async check(sock, msg, from, groupSettings) {
    if (!groupSettings.antibadword) return false;

    const body = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || ''
    ).trim();
    if (!body) return false;

    const customList = groupSettings.badWordList || [];
    const allWords   = [...DEFAULT_BAD_WORDS, ...customList];
    const matched    = containsBadWord(body, allWords);
    if (!matched) return false;

    const sender = msg.key.participant || msg.key.remoteJid;
    const action = groupSettings.antibadwordAction || 'delete';
    const tag    = `@${sender.split('@')[0]}`;

    try { await sock.sendMessage(from, { delete: msg.key }); } catch {}

    if (action === 'warn') {
      const warns = database.addWarn ? database.addWarn(from, sender) : 1;
      await sock.sendMessage(from, {
        text: `⚠️ ${tag} — language warning! No offensive words here. Warn #${warns}.`,
        mentions: [sender],
      });
    } else if (action === 'kick') {
      await sock.sendMessage(from, {
        text: `🚫 ${tag} was removed for using offensive language.`,
        mentions: [sender],
      });
      try { await sock.groupParticipantsUpdate(from, [sender], 'remove'); } catch {}
    }
    return true;
  },
};
