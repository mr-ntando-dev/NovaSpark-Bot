/**
 * ⚡ NovaSpark Bot v5 — GetPP (Profile Picture)
 * Fetch the profile picture of a mentioned user or yourself
 * Ported from KnightBot-Mini | By Dev-Ntando
 */
'use strict';
module.exports = {
  name: 'getpp',
  aliases: ['pfp', 'pp', 'avatar', 'dp'],
  category: 'tools',
  description: 'Get profile picture of a user',
  usage: '.getpp [@user]',

  async execute(sock, msg, args, extra) {
    try {
      const ctx       = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      const target    = mentioned[0] || (ctx.stanzaId && ctx.participant ? ctx.participant : extra.sender);
      const tag       = `@${target.split('@')[0]}`;

      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(target, 'image');
      } catch {
        return extra.reply(`❌ Could not fetch the profile picture for ${tag}. It may be hidden.`);
      }

      await sock.sendMessage(extra.from, {
        image:   { url: ppUrl },
        caption: `🖼️ *Profile Picture*\n\n${tag}`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      await extra.reply(`❌ Error: ${e.message}`);
    }
  },
};
