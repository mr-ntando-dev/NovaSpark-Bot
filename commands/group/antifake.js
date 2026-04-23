/**
 * ⚡ NovaSpark Bot v7 — AntiFake
 * Detects & removes fake/unofficial WhatsApp numbers in groups
 * (numbers that don't match real WA format, likely fake bots)
 * Auto-runs on group-participants.update when enabled
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// Known fake WA number patterns & suspicious JID patterns
const FAKE_PATTERNS = [
  /^0{6,}/,          // starts with many zeros
  /^999/,            // 999xxx numbers often used by fake WA clients
  /^888/,
  /^1234/,
  /^\d{3,5}@/,       // very short numbers (< 6 digits)
];

function isSuspectNumber(jid) {
  const num = jid.split('@')[0];
  if (num.length < 6)  return true;   // too short to be real
  if (num.length > 15) return false;   // too long — probably fine
  return FAKE_PATTERNS.some(re => re.test(num));
}

module.exports = {
  name: 'antifake',
  aliases: ['fakedetect'],
  category: 'group',
  description: 'Remove suspected fake/unofficial WhatsApp accounts from group',
  usage: '.antifake on | off | get',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply }) {
    try {
      const opt = (args[0] || '').toLowerCase();
      const s   = database.getGroupSettings(from);

      if (!opt || opt === 'get') {
        return reply(
          `🤖 *AntiFake — NovaSpark*\n\n` +
          `Status : *${s.antifake ? '🟢 ON' : '🔴 OFF'}*\n\n` +
          `Detects numbers that appear fake/unofficial\n` +
          `(very short numbers, pattern-matched bots)\n\n` +
          `  .antifake on\n` +
          `  .antifake off`
        );
      }
      if (opt === 'on') {
        database.updateGroupSettings(from, { antifake: true });
        return reply('🤖 *AntiFake is ON* — suspicious numbers will be removed on join.');
      }
      if (opt === 'off') {
        database.updateGroupSettings(from, { antifake: false });
        return reply('🤖 *AntiFake is OFF*.');
      }
      return reply('❓ Usage: `.antifake on | off | get`');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },

  /**
   * checkJoin — call this from handler on group-participants.update (action=add)
   */
  async checkJoin(sock, from, participantJid, groupSettings) {
    if (!groupSettings.antifake) return false;
    if (!isSuspectNumber(participantJid)) return false;

    try {
      await sock.sendMessage(from, {
        text: `🤖 *AntiFake:* Removed @${participantJid.split('@')[0]} — suspected fake/unofficial account.`,
        mentions: [participantJid],
      });
      await sock.groupParticipantsUpdate(from, [participantJid], 'remove');
    } catch {}
    return true;
  },
};
