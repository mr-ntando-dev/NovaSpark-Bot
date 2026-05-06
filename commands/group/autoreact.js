/**
 * ⚡ NovaSpark v4 — Auto React
 * .autoreact on/off [mode]
 * Modes: random | mood | keyword
 * Bot reacts to messages with emojis automatically.
 * NEVER in other MD bots.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const EMOJI_POOL = ['❤️','🔥','😂','👏','🤩','💯','✅','👍','😮','🎉','⚡','🙌','😍','🤣','💪'];

const MOOD_MAP = {
  happy: ['😂','😄','🎉','🥳','❤️'],
  sad:   ['😢','💔','🤗','❤️'],
  angry: ['😅','🙏','💙','🤝'],
  love:  ['❤️','😍','💕','🥰'],
  fire:  ['🔥','⚡','💯','🤩'],
};

/**
 * Detect message mood from text
 */
function detectMood(text) {
  const t = text.toLowerCase();
  if (/haha|lol|😂|🤣|funny/.test(t))   return 'happy';
  if (/sad|cry|😢|miss|lonely/.test(t)) return 'sad';
  if (/angry|mad|hate|😡|🤬/.test(t))   return 'angry';
  if (/love|❤️|miss you|beautiful/.test(t)) return 'love';
  if (/fire|🔥|lit|best|amazing/.test(t)) return 'fire';
  return null;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = {
  name: 'autoreact',
  aliases: ['react'],
  description: 'Auto-react to messages with emojis (random/mood/keyword)',
  category: 'group',
  adminOnly: true,

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub  = (args[0] || '').toLowerCase();
    const mode = args[1] || 'random';

    if (!['on', 'off'].includes(sub)) {
      const gs = database.getGroupSettings(from);
      return reply(
        `😄 *Auto React*\n\nCurrent: *${gs.autoReact ? 'ON' : 'OFF'}*\n\n` +
        'Usage:\n' +
        '  `.autoreact on random` — Random emojis on every message\n' +
        '  `.autoreact on mood` — Emoji matches message mood/sentiment\n' +
        '  `.autoreact off` — Disable'
      );
    }

    if (sub === 'off') {
      database.updateGroupSettings(from, { autoReact: false });
      return reply('😐 Auto React: OFF');
    }

    database.updateGroupSettings(from, { autoReact: true, autoReactMode: mode });
    return reply(
      `😄 *Auto React: ON*\nMode: *${mode}*\n\n` +
      (mode === 'mood'
        ? '🧠 I\'ll match emojis to the mood of each message.'
        : '🎲 I\'ll react with random emojis.')
    );
  },

  // Called by handler.js on each message
  react: async (sock, msg, from, groupSettings) => {
    if (!groupSettings.autoReact) return;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!text) return;
    let emoji;
    const mode = groupSettings.autoReactMode || 'random';
    if (mode === 'mood') {
      const mood = detectMood(text);
      emoji = mood ? pick(MOOD_MAP[mood]) : pick(EMOJI_POOL);
    } else {
      emoji = pick(EMOJI_POOL);
    }
    try {
      await sock.sendMessage(from, {
        react: { text: emoji, key: msg.key },
      });
    } catch {}
  },
};
