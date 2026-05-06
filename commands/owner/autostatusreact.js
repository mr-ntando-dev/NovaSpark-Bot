/**
 * ⚡ NovaSpark Bot v10 — Auto Status React
 * .autostatusreact on/off   — Auto-react to all contacts' statuses
 * .autostatusreact emoji 🔥 — Set the reaction emoji
 * Automatically reacts to every WhatsApp status update from contacts
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const DEFAULT_EMOJIS = ['🔥', '❤️', '😍', '👏', '💯', '⚡', '🙏', '✨', '💪', '👑'];

module.exports = {
  name: 'autostatusreact',
  aliases: ['statusreact', 'autoreactstatus', 'asreact'],
  description: 'Auto-react to WhatsApp statuses from all contacts',
  category: 'owner',
  ownerOnly: true,

  // Called by index.js on status updates
  onStatusUpdate: async ({ sock, msg }) => {
    const enabled = database.getGlobalSetting ? database.getGlobalSetting('autoStatusReact') : false;
    if (!enabled) return;

    try {
      const emoji = database.getGlobalSetting('autoStatusReactEmoji') || null;
      const reaction = emoji || DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];

      await sock.sendMessage('status@broadcast', {
        react: { text: reaction, key: msg.key },
      }, { statusJidList: [msg.key.participant] });
    } catch {}
  },

  execute: async ({ sock, msg, from, args, reply, isOwner }) => {
    if (!isOwner) return reply('👑 Owner only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoStatusReact', true);
      const emoji = database.getGlobalSetting ? database.getGlobalSetting('autoStatusReactEmoji') : null;
      return reply(
        '🔥 *Auto Status React: ON*\n\n' +
        `Reaction: ${emoji || 'Random from ' + DEFAULT_EMOJIS.slice(0, 5).join(' ')}\n` +
        'All contact statuses will get auto-reacted to.\n\n' +
        '_Use `.autostatusreact emoji 🔥` to set a fixed emoji._'
      );
    }
    if (sub === 'off') {
      if (database.setGlobalSetting) database.setGlobalSetting('autoStatusReact', false);
      return reply('🔥 *Auto Status React: OFF*');
    }
    if (sub === 'emoji') {
      const emoji = args[1];
      if (!emoji) return reply('❌ Usage: `.autostatusreact emoji 🔥`\nOr `.autostatusreact emoji random` for random mode.');
      if (emoji === 'random') {
        if (database.setGlobalSetting) database.setGlobalSetting('autoStatusReactEmoji', null);
        return reply('🎲 Reaction set to *random* mode.');
      }
      if (database.setGlobalSetting) database.setGlobalSetting('autoStatusReactEmoji', emoji);
      return reply(`✅ Status reaction emoji set to: ${emoji}`);
    }

    const isOn = database.getGlobalSetting ? database.getGlobalSetting('autoStatusReact') : false;
    const emoji = database.getGlobalSetting ? database.getGlobalSetting('autoStatusReactEmoji') : null;
    return reply(
      '🔥 *Auto Status React*\n\n' +
      `Status: *${isOn ? 'ON ✅' : 'OFF ❌'}*\n` +
      `Emoji: ${emoji || 'Random'}\n\n` +
      '`.autostatusreact on/off` — Toggle\n' +
      '`.autostatusreact emoji 🔥` — Set fixed emoji\n' +
      '`.autostatusreact emoji random` — Random reactions'
    );
  },
};
