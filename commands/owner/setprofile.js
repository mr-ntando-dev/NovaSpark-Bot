/**
 * ⚡ NovaSpark Bot v5 — Set Bot Profile
 * .setname <name>   — change bot's WhatsApp display name
 * .setstatus <text> — update bot's About/status line
 * .setpp            — change bot's profile picture (reply to an image)
 * By Dev-Ntando
 */
'use strict';
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = [
  // ── .setname ──────────────────────────────────────────────────────────────
  {
    name: 'setname',
    aliases: ['botname', 'changename'],
    description: "✏️ Change the bot's WhatsApp display name",
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, args, reply }) {
      const name = args.join(' ').trim();
      if (!name) return reply('Usage: `.setname <new name>`\nExample: `.setname NovaSpark v5 ⚡`');

      try {
        await sock.updateProfileName(name);
        await reply(`✅ Bot name updated to: *${name}*`);
      } catch (err) {
        await reply(`❌ Failed to update name: ${err.message}\n\n_Note: WhatsApp Business accounts may restrict this._`);
      }
    },
  },

  // ── .setstatus ────────────────────────────────────────────────────────────
  {
    name: 'setstatus',
    aliases: ['setbio', 'botstatus', 'setabout'],
    description: "📝 Update the bot's WhatsApp About/status",
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, args, reply }) {
      const status = args.join(' ').trim();
      if (!status) return reply('Usage: `.setstatus <text>`\nExample: `.setstatus ⚡ NovaSpark Bot v5 | 2026`');

      try {
        await sock.updateProfileStatus(status);
        await reply(`✅ Bot status updated to:\n_"${status}"_`);
      } catch (err) {
        await reply(`❌ Failed to update status: ${err.message}`);
      }
    },
  },

  // ── .setpp ────────────────────────────────────────────────────────────────
  {
    name: 'setpp',
    aliases: ['setpfp', 'botpp', 'setprofilepic'],
    description: "🖼️ Change the bot's profile picture (reply to an image)",
    category: 'owner',
    ownerOnly: true,

    async execute({ sock, msg, reply }) {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
                  || msg.message;

      const imgMsg = quoted?.imageMessage;
      if (!imgMsg) {
        return reply('📸 Reply to an image with `.setpp` to set it as the bot\'s profile picture.');
      }

      try {
        const buffer = await downloadMediaMessage(
          { message: { imageMessage: imgMsg }, key: msg.key },
          'buffer',
          {},
        );
        await sock.updateProfilePicture(sock.user.id, buffer);
        await reply('✅ Bot profile picture updated!');
      } catch (err) {
        await reply(`❌ Failed to update profile picture: ${err.message}`);
      }
    },
  },
];
