/**
 * ⚡ NovaSpark v4 — AI Anti-Toxic Filter
 * .antitoxic on/off
 * Uses a keyword + heuristic AI scan to detect and warn/delete toxic messages.
 * NEVER SEEN in WhatsApp MD bots before.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const config   = require('../../config');
const axios    = require('axios');

// Toxic keyword seed list (expanded by heuristic scoring)
const TOXIC_SEEDS = [
  'kill yourself', 'kys', 'go die', 'i will kill', 'bomb', 'rape', 'shoot you',
  'i hate you', 'shut up', 'stupid', 'idiot', 'moron', 'loser', 'trash',
  'racist', 'slur', 'fuck you', 'bitch', 'bastard', 'asshole',
];

/**
 * Heuristic toxicity score — 0 (clean) to 1 (very toxic)
 * Works offline, no API needed.
 */
function scoreToxicity(text) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const seed of TOXIC_SEEDS) {
    if (lower.includes(seed)) score += 0.3;
  }
  // Caps lock rage detection
  const upperRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (upperRatio > 0.6 && text.length > 8) score += 0.15;
  // Repeated chars aggression
  if (/(.)\1{4,}/.test(text)) score += 0.1;
  return Math.min(score, 1);
}

module.exports = {
  name: 'antitoxic',
  aliases: ['toxicfilter', 'cleangroup'],
  description: 'AI-powered toxic message filter — warns & deletes toxic content',
  category: 'group',
  adminOnly: true,

  execute: async ({ sock, msg, from, args, reply, isAdmin, isBotAdmin }) => {
    if (!isBotAdmin) return reply('🤖 I need admin rights to delete messages!');
    if (!isAdmin) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(sub)) {
      return reply(
        '🧠 *AI Anti-Toxic Filter*\n\n' +
        'Usage:\n' +
        '  `.antitoxic on`\n' +
        '  `.antitoxic off`\n\n' +
        'Scans every message for hate speech, threats and abuse.\n' +
        'Toxic messages are deleted and the sender warned automatically.'
      );
    }

    database.updateGroupSettings(from, { antitoxic: sub === 'on' });
    if (sub === 'on') {
      return reply(
        '🧠 *Anti-Toxic Filter: ON* ✅\n\n' +
        'I\'m now scanning every message.\n' +
        'Hate speech, threats and abuse will be deleted automatically.\n\n' +
        '_Powered by NovaSpark AI — no external API needed._'
      );
    } else {
      return reply('🧠 *Anti-Toxic Filter: OFF*\nManual moderation mode resumed.');
    }
  },

  // Called by handler.js on every group message when antitoxic is enabled
  scan: async (sock, msg, from, groupSettings) => {
    if (!groupSettings.antitoxic) return false;
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || '';
    if (!text || text.startsWith(config.prefix)) return false;

    const score = scoreToxicity(text);
    if (score >= 0.3) {
      const sender = msg.key.participant || msg.key.remoteJid;
      const num    = sender.split('@')[0];
      // Delete the toxic message
      try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
      // Warn the user
      const warns = database.addWarn(from, sender, 'AI Anti-Toxic Filter');
      const maxW  = groupSettings.maxWarn || 3;
      const kicked = warns >= maxW;
      if (kicked) {
        try {
          await sock.groupParticipantsUpdate(from, [sender], 'remove');
          database.clearWarns(from, sender);
        } catch {}
      }
      await sock.sendMessage(from, {
        text:
          `🧠 *Anti-Toxic Alert*\n\n` +
          `@${num} — Your message was removed for toxic content.\n` +
          `⚠️ Warns: *${warns}/${maxW}*\n` +
          (kicked ? `🚫 You have been removed.` : `_${maxW - warns} warn(s) left before kick._`),
        mentions: [sender],
      });
      return true; // handled
    }
    return false;
  },
};
