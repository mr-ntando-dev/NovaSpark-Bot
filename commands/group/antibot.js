/**
 * ⚡ NovaSpark Bot — Anti-Bot Protection
 * .antibot on/off  — auto-kick bots that join the group
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

const BOT_PATTERNS = [
  /bot$/i, /^bot/i, /\bbot\b/i,
  /autobot/i, /spambot/i, /flooderbot/i,
  /wa\.me\/\d+bot/i,
];

function looksLikeBot(name = '', jid = '') {
  return BOT_PATTERNS.some(p => p.test(name) || p.test(jid));
}

module.exports = {
  name: 'antibot',
  aliases: ['botguard', 'nobot'],
  category: 'group',
  description: 'Auto-kick bots that join the group',
  usage: '.antibot on  |  .antibot off  |  .antibot status',
  adminOnly: true,
  groupOnly: true,

  async execute({ args, reply, from, groupSettings, updateGroupSetting }) {
    const mode = (args[0] || '').toLowerCase();

    if (!mode || mode === 'status') {
      const enabled = groupSettings?.antibot === true;
      return reply(
        `🤖 *Anti-Bot Protection*\n\n` +
        `Status: ${enabled ? '✅ ON' : '❌ OFF'}\n\n` +
        `When ON, any account whose name or number contains "bot"\n` +
        `will be automatically kicked on joining.\n\n` +
        `Usage: \`.antibot on\` / \`.antibot off\``
      );
    }

    if (mode === 'on') {
      await updateGroupSetting('antibot', true);
      return reply('✅ *Anti-Bot Protection* enabled! Bots will be auto-kicked on join.');
    }

    if (mode === 'off') {
      await updateGroupSetting('antibot', false);
      return reply('❌ *Anti-Bot Protection* disabled.');
    }

    return reply('❓ Usage: `.antibot on` / `.antibot off` / `.antibot status`');
  },

  // Called by the group-participant-update event handler
  async onJoin({ sock, group, participant, groupSettings }) {
    if (!groupSettings?.antibot) return;
    const jid  = participant;
    const name = (participant.split('@')[0] || '');
    if (looksLikeBot(name, jid)) {
      try {
        await sock.groupParticipantsUpdate(group, [jid], 'remove');
        await sock.sendMessage(group, { text: `🤖 *Anti-Bot:* Kicked *@${name}* — detected as bot.`, mentions: [jid] });
      } catch {}
    }
  },
};
