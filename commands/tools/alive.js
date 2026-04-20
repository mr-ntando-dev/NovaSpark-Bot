/**
 * ⚡ NovaSpark Bot v5 — Alive
 * Quick "I'm online" status card
 * Inspired by Knightbot-MD | By Dev-Ntando
 */
'use strict';
const config = require('../../config');

module.exports = {
  name: 'alive',
  aliases: ['status', 'online', 'uptime'],
  category: 'tools',
  description: 'Check if the bot is alive',
  usage: '.alive',

  async execute({ sock, msg, from, args, reply, sender, isAdmin, isBotAdmin, groupMeta, groupSettings, mentions, body }) {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    await sock.sendMessage(from, {
      text:
        `╔═══════════════════════════╗\n` +
        `  ⚡ *NovaSpark Bot — ALIVE!*  \n` +
        `╚═══════════════════════════╝\n\n` +
        `🤖 Bot     : *${config.botName}*\n` +
        `📦 Version : *v${config.botVersion}*\n` +
        `✅ Status  : *Online*\n` +
        `⏱️ Uptime  : *${h}h ${m}m ${s}s*\n` +
        `⚡ Prefix  : *${config.prefix}*\n\n` +
        `🌟 *Features:*\n` +
        `• 60+ commands across 10 categories\n` +
        `• AI autochat & homework help\n` +
        `• Games, stickers, memes & more\n` +
        `• Full group management suite\n\n` +
        `Type *.menu* for the full command list 📋\n` +
        `📡 Channel: ${config.channelLink}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid:     '120363161513685998@newsletter',
          newsletterName:    'NovaSpark Bot',
          serverMessageId:   -1,
        },
      },
    }, { quoted: msg });
  },
};
