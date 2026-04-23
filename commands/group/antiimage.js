/**
 * ⚡ NovaSpark v9 — Anti-Image / Anti-Video / Anti-Sticker
 * .antiimage on/off — Block images from non-admins
 * .antivideo on/off — Block videos from non-admins
 * .antisticker on/off — Block stickers from non-admins
 * .antimedia on/off — Block all media (images + videos + stickers)
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

function makeCmd(name, settingKey, emoji, label) {
  return {
    name,
    aliases: [],
    description: `${emoji} Toggle ${label} blocking in this group`,
    category: 'group',
    adminOnly: true,

    execute: async ({ sock, from, args, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const sub = (args[0] || '').toLowerCase();
      const gs = database.getGroupSettings(from);

      if (sub === 'on') {
        database.updateGroupSettings(from, { [settingKey]: true });
        return reply(`${emoji} *${label} blocking: ON* ✅\nNon-admins can no longer send ${label.toLowerCase()}.`);
      }
      if (sub === 'off') {
        database.updateGroupSettings(from, { [settingKey]: false });
        return reply(`${emoji} *${label} blocking: OFF*`);
      }
      return reply(`${emoji} *${label} Blocker*\nStatus: *${gs[settingKey] ? 'ON ✅' : 'OFF ❌'}*\n\n*.${name} on* — Enable\n*.${name} off* — Disable`);
    },

    check: async (sock, msg, from, groupSettings) => {
      if (!groupSettings[settingKey]) return false;
      const msgContent = msg.message || {};
      const isImage   = !!msgContent.imageMessage;
      const isVideo   = !!msgContent.videoMessage;
      const isSticker = !!msgContent.stickerMessage;
      const shouldBlock =
        (settingKey === 'antiImage'   && isImage) ||
        (settingKey === 'antiVideo'   && isVideo) ||
        (settingKey === 'antiSticker' && isSticker) ||
        (settingKey === 'antiMedia'   && (isImage || isVideo || isSticker));

      if (shouldBlock) {
        try {
          await sock.sendMessage(from, { delete: msg.key });
        } catch {}
        return true;
      }
      return false;
    },
  };
}

module.exports = [
  makeCmd('antiimage',   'antiImage',   '🖼️', 'Image'),
  makeCmd('antivideo',   'antiVideo',   '🎥', 'Video'),
  makeCmd('antisticker', 'antiSticker', '🎭', 'Sticker'),
  {
    name: 'antimedia',
    aliases: ['blockmedia'],
    description: '🚫 Block all media (images, videos, stickers) from non-admins',
    category: 'group',
    adminOnly: true,

    execute: async ({ from, args, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'on') {
        database.updateGroupSettings(from, { antiImage: true, antiVideo: true, antiSticker: true, antiMedia: true });
        return reply('🚫 *All media blocking: ON* ✅\nImages, videos, and stickers are blocked for non-admins.');
      }
      if (sub === 'off') {
        database.updateGroupSettings(from, { antiImage: false, antiVideo: false, antiSticker: false, antiMedia: false });
        return reply('🚫 *All media blocking: OFF*');
      }
      const gs = database.getGroupSettings(from);
      const on = gs.antiImage || gs.antiVideo || gs.antiSticker;
      return reply(`🚫 *Anti-Media*\nStatus: *${on ? 'PARTIAL/ON ✅' : 'OFF ❌'}*\n\n*.antimedia on/off*`);
    },
  },
];
