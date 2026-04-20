/**
 * ⚡ NovaSpark Bot v5 — AntiLink
 * Blocks WhatsApp invite links + any URLs in group
 * Action: delete msg, warn, or kick
 * Ported & expanded from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
const database = require('../../database');

module.exports = {
  name: 'antilink',
  aliases: ['linkblock'],
  category: 'group',
  description: 'Toggle antilink protection (delete/warn/kick)',
  usage: '.antilink on | off | set <delete|warn|kick> | get',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    try {
      const opt = (args[0] || '').toLowerCase();

      if (!opt || opt === 'get') {
        const s      = database.getGroupSettings(from);
        const status = s.antilink       ? '🟢 ON'   : '🔴 OFF';
        const action = s.antilinkAction || 'delete';
        return reply(
          `🔗 *AntiLink — NovaSpark*\n\n` +
          `Status : *${status}*\n` +
          `Action : *${action}*\n\n` +
          `Commands:\n` +
          `  .antilink on\n` +
          `  .antilink off\n` +
          `  .antilink set delete | warn | kick\n` +
          `  .antilink get`
        );
      }

      if (opt === 'on') {
        database.updateGroupSettings(from, { antilink: true });
        return reply('🔗 *AntiLink is now ON* — links will be blocked.');
      }

      if (opt === 'off') {
        database.updateGroupSettings(from, { antilink: false });
        return reply('🔗 *AntiLink is now OFF*.');
      }

      if (opt === 'set') {
        const action = (args[1] || '').toLowerCase();
        if (!['delete', 'warn', 'kick'].includes(action)) {
          return reply('❌ Valid actions: *delete* | *warn* | *kick*');
        }
        database.updateGroupSettings(from, { antilinkAction: action, antilink: true });
        return reply(`🔗 *AntiLink action set to* \`${action}\` and *turned ON*.`);
      }

      return reply('❓ Usage: `.antilink on | off | set <delete|warn|kick> | get`');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },

  // Called by handler for every non-command group message
  async check(sock, msg, from, groupSettings) {
    if (!groupSettings.antilink) return false;
    const body = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || ''
    ).trim();

    const linkRegex = /(?:https?:\/\/|www\.)\S+|chat\.whatsapp\.com\/\S+/gi;
    const hasLink   = linkRegex.test(body);
    if (!hasLink) return false;

    const sender = msg.key.participant || msg.key.remoteJid;
    const action = groupSettings.antilinkAction || 'delete';

    try { await sock.sendMessage(from, { delete: msg.key }); } catch {}

    if (action === 'warn' || action === 'kick') {
      const warns = database.addWarn ? database.addWarn(from, sender) : 1;
      const tag   = `@${sender.split('@')[0]}`;

      if (action === 'kick') {
        await sock.sendMessage(from, {
          text: `🚫 ${tag} was removed for sending a link.`,
          mentions: [sender],
        });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
      } else {
        await sock.sendMessage(from, {
          text: `⚠️ ${tag} — no links allowed! Warn #${warns}.`,
          mentions: [sender],
        });
      }
    }
    return true;
  },
};
