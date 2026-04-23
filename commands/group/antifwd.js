/**
 * ⚡ NovaSpark Bot v7 — AntiFWD
 * Blocks forwarded messages in groups
 * Auto-starts if enabled in config on bot online
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'antifwd',
  aliases: ['antiforward'],
  category: 'group',
  description: 'Block forwarded messages in group',
  usage: '.antifwd on | off | set <delete|warn|kick> | get',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply, sender }) {
    try {
      const opt = (args[0] || '').toLowerCase();
      const s   = database.getGroupSettings(from);

      if (!opt || opt === 'get') {
        const status = s.antifwd       ? '🟢 ON'    : '🔴 OFF';
        const action = s.antifwdAction || 'delete';
        return reply(
          `📨 *AntiFWD — NovaSpark*\n\n` +
          `Status : *${status}*\n` +
          `Action : *${action}*\n\n` +
          `Commands:\n` +
          `  .antifwd on\n` +
          `  .antifwd off\n` +
          `  .antifwd set delete | warn | kick\n` +
          `  .antifwd get`
        );
      }
      if (opt === 'on') {
        database.updateGroupSettings(from, { antifwd: true });
        return reply('📨 *AntiFWD is now ON* — forwarded messages will be blocked.');
      }
      if (opt === 'off') {
        database.updateGroupSettings(from, { antifwd: false });
        return reply('📨 *AntiFWD is now OFF*.');
      }
      if (opt === 'set') {
        const action = (args[1] || '').toLowerCase();
        if (!['delete', 'warn', 'kick'].includes(action)) {
          return reply('❌ Valid actions: *delete* | *warn* | *kick*');
        }
        database.updateGroupSettings(from, { antifwd: true, antifwdAction: action });
        return reply(`📨 *AntiFWD action set to* \`${action}\` and *turned ON*.`);
      }
      return reply('❓ Usage: `.antifwd on | off | set <delete|warn|kick> | get`');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },

  async check(sock, msg, from, groupSettings) {
    if (!groupSettings.antifwd) return false;

    // Detect forwarded message
    const ctx = msg.message?.extendedTextMessage?.contextInfo
              || msg.message?.imageMessage?.contextInfo
              || msg.message?.videoMessage?.contextInfo
              || msg.message?.documentMessage?.contextInfo
              || msg.message?.audioMessage?.contextInfo
              || null;

    const isForwarded = ctx && ctx.isForwarded === true;
    if (!isForwarded) return false;

    const sender = msg.key.participant || msg.key.remoteJid;
    const action = groupSettings.antifwdAction || 'delete';
    const tag    = `@${sender.split('@')[0]}`;

    try { await sock.sendMessage(from, { delete: msg.key }); } catch {}

    if (action === 'warn') {
      const warns = database.addWarn ? database.addWarn(from, sender) : 1;
      await sock.sendMessage(from, {
        text: `⚠️ ${tag} — no forwarded messages allowed! Warn #${warns}.`,
        mentions: [sender],
      });
    } else if (action === 'kick') {
      await sock.sendMessage(from, {
        text: `🚫 ${tag} was removed for sending forwarded messages.`,
        mentions: [sender],
      });
      try { await sock.groupParticipantsUpdate(from, [sender], 'remove'); } catch {}
    }
    return true;
  },
};
