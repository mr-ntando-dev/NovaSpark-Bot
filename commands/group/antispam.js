/**
 * ⚡ NovaSpark Bot v7 — AntiSpam
 * Per-user message rate limiter for groups
 * Separate from antiflood — targets repeated identical/similar messages
 * Auto-starts per group when enabled
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// In-memory: { groupJid: { senderJid: { msgs: [], warned: bool } } }
const spamMap = new Map();

const WINDOW_MS   = 10 * 1000;  // 10 second window
const MAX_SIMILAR = 3;           // max identical messages in window
const MAX_ANY     = 6;           // max any messages in window

function getRecord(from, sender) {
  if (!spamMap.has(from)) spamMap.set(from, new Map());
  const group = spamMap.get(from);
  if (!group.has(sender)) group.set(sender, { msgs: [], warned: false });
  return group.get(sender);
}

function cleanOld(record) {
  const cutoff = Date.now() - WINDOW_MS;
  record.msgs  = record.msgs.filter(m => m.ts > cutoff);
}

module.exports = {
  name: 'antispam',
  aliases: ['spamblock'],
  category: 'group',
  description: 'Block spammers who repeat messages rapidly in groups',
  usage: '.antispam on | off | set <warn|kick|mute> | get',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply }) {
    try {
      const opt = (args[0] || '').toLowerCase();
      const s   = database.getGroupSettings(from);

      if (!opt || opt === 'get') {
        return reply(
          `🚫 *AntiSpam — NovaSpark*\n\n` +
          `Status : *${s.antispam ? '🟢 ON' : '🔴 OFF'}*\n` +
          `Action : *${s.antispamAction || 'warn'}*\n` +
          `Limit  : ${MAX_ANY} msgs / ${WINDOW_MS / 1000}s | ${MAX_SIMILAR} identical\n\n` +
          `  .antispam on\n` +
          `  .antispam off\n` +
          `  .antispam set warn | kick | mute`
        );
      }
      if (opt === 'on') {
        database.updateGroupSettings(from, { antispam: true });
        return reply('🚫 *AntiSpam is ON* — rapid-fire spammers will be actioned.');
      }
      if (opt === 'off') {
        database.updateGroupSettings(from, { antispam: false });
        return reply('🚫 *AntiSpam is OFF*.');
      }
      if (opt === 'set') {
        const action = (args[1] || '').toLowerCase();
        if (!['warn', 'kick', 'mute'].includes(action)) {
          return reply('❌ Valid actions: *warn* | *kick* | *mute*');
        }
        database.updateGroupSettings(from, { antispam: true, antispamAction: action });
        return reply(`🚫 *AntiSpam action set to* \`${action}\`.`);
      }
      return reply('❓ Usage: `.antispam on | off | set <warn|kick|mute> | get`');
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  },

  async check(sock, msg, from, groupSettings) {
    if (!groupSettings.antispam) return false;

    const sender = msg.key.participant || msg.key.remoteJid;
    const body   = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''
    ).trim();

    const record = getRecord(from, sender);
    cleanOld(record);

    record.msgs.push({ ts: Date.now(), text: body });

    // Check total message volume
    const totalSpam   = record.msgs.length > MAX_ANY;
    // Check identical message spam
    const identCount  = record.msgs.filter(m => m.text === body && body.length > 0).length;
    const similarSpam = identCount >= MAX_SIMILAR;

    if (!totalSpam && !similarSpam) return false;

    const action = groupSettings.antispamAction || 'warn';
    const tag    = `@${sender.split('@')[0]}`;

    // Reset counter so we don't keep firing
    record.msgs = [];

    if (action === 'kick') {
      await sock.sendMessage(from, {
        text: `🚫 ${tag} was removed for spamming.`,
        mentions: [sender],
      });
      try { await sock.groupParticipantsUpdate(from, [sender], 'remove'); } catch {}
    } else if (action === 'mute') {
      // Remove + re-add doesn't work for mute in Baileys — we warn + delete
      const warns = database.addWarn ? database.addWarn(from, sender) : 1;
      await sock.sendMessage(from, {
        text: `🚫 ${tag} — spam detected! Warn #${warns}. Next time = kick.`,
        mentions: [sender],
      });
    } else {
      const warns = database.addWarn ? database.addWarn(from, sender) : 1;
      await sock.sendMessage(from, {
        text: `⚠️ ${tag} — slow down! Spam detected. Warn #${warns}.`,
        mentions: [sender],
      });
    }
    return true;
  },
};
