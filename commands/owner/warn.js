/**
 * NovaSpark Bot v3 — Warning System
 * .warn @user [reason]  — add a warning (admin or owner only)
 * .warns @user           — check warning count
 * .clearwarn @user       — clear all warnings (owner only)
 * Auto-removes user from group at 3 warnings
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');
const config   = require('../../config');

const MAX_WARNINGS = 3;

// ── Warn storage helpers ──────────────────────────────────────────────────────
function getWarns(userId) {
  const db  = database.getSetting('warns') || {};
  const num = userId.includes('@') ? userId.split('@')[0] : userId;
  return db[num] || { count: 0, reasons: [], lastAt: null };
}

function setWarns(userId, data) {
  const db  = database.getSetting('warns') || {};
  const num = userId.includes('@') ? userId.split('@')[0] : userId;
  db[num]   = data;
  database.setSetting('warns', db);
}

function clearWarns(userId) {
  const db  = database.getSetting('warns') || {};
  const num = userId.includes('@') ? userId.split('@')[0] : userId;
  delete db[num];
  database.setSetting('warns', db);
}

// ── .warn ─────────────────────────────────────────────────────────────────────
const warnCmd = {
  name:    'warn',
  aliases: [],
  description: '(Admin) Warn a user — 3 warnings = auto-kick from group',
  category: 'owner',

  execute: async ({ sock, from, sender, args, msg, isOwner, isAdmin, isGroup, reply }) => {
    if (!isGroup)  return reply('👥 This command only works in groups.');
    if (!isOwner && !isAdmin) return reply('🛡️ Admins and the bot owner only.');

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0] || null;

    if (!target) {
      return reply(
        '⚠️ *Warn User*\n\n' +
        'Usage: *.warn @user [reason]*\n\n' +
        'Example:\n  .warn @user spamming the group'
      );
    }

    const reason     = args.filter(a => !a.startsWith('@') && !/^\d+@/.test(a)).join(' ').trim() || 'No reason given';
    const targetNum  = target.split('@')[0];
    const warnsData  = getWarns(target);

    warnsData.count++;
    warnsData.reasons.push({ reason, by: sender.split('@')[0], at: Date.now() });
    warnsData.lastAt = Date.now();
    setWarns(target, warnsData);

    const warnIcons = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];
    const icon      = warnIcons[(warnsData.count - 1)] || `${warnsData.count}.`;

    if (warnsData.count >= MAX_WARNINGS) {
      // Auto-kick
      try {
        await sock.groupParticipantsUpdate(from, [target], 'remove');
        clearWarns(target);
        return reply(
          `🚫 *User Removed*\n\n` +
          `@${targetNum} has been removed after receiving *${MAX_WARNINGS} warnings*.\n\n` +
          `*Last reason:* ${reason}\n\n` +
          `_Nova AI ⚡_`,
          { mentions: [target] }
        );
      } catch {
        return reply(
          `⚠️ *Warning ${icon} issued to @${targetNum}*\n\n` +
          `*Reason:* ${reason}\n` +
          `*Total:* ${warnsData.count}/${MAX_WARNINGS} ⚠️\n\n` +
          `❌ Tried to remove but I\'m not an admin in this group.\n_Nova AI ⚡_`
        );
      }
    }

    const remaining = MAX_WARNINGS - warnsData.count;
    await reply(
      `⚠️ *Warning ${icon} issued!*\n\n` +
      `👤 User: @${targetNum}\n` +
      `📋 Reason: ${reason}\n` +
      `📊 Warnings: ${warnsData.count}/${MAX_WARNINGS}\n` +
      `${remaining === 1 ? '🚨 *One more warning = auto-kick!*' : `⚠️ ${remaining} warnings left before kick`}\n\n` +
      `_Nova AI ⚡_`
    );
  },
};

// ── .warns ────────────────────────────────────────────────────────────────────
const warnsCmd = {
  name:    'warns',
  aliases: ['checkwarn', 'warncount'],
  description: 'Check how many warnings a user has',
  category: 'owner',

  execute: async ({ sock, from, sender, args, msg, isGroup, reply }) => {
    if (!isGroup) return reply('👥 Groups only.');

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0] || sender;
    const targetNum = target.split('@')[0];
    const warnsData = getWarns(target);

    if (warnsData.count === 0) {
      return reply(`✅ @${targetNum} has *no warnings*. Clean record! 👍\n\n_Nova AI ⚡_`);
    }

    const reasonList = warnsData.reasons
      .slice(-3)
      .map((w, i) => `  ${i + 1}. ${w.reason} _(by +${w.by})_`)
      .join('\n');

    await reply(
      `⚠️ *Warnings for @${targetNum}*\n` +
      `${'─'.repeat(25)}\n\n` +
      `📊 *Total:* ${warnsData.count}/${MAX_WARNINGS}\n\n` +
      `*Recent reasons:*\n${reasonList}\n\n` +
      `${warnsData.count >= MAX_WARNINGS ? '🚨 *At limit — will be removed on next warn!*' : `${MAX_WARNINGS - warnsData.count} warning${MAX_WARNINGS - warnsData.count > 1 ? 's' : ''} remaining`}\n\n` +
      `_Nova AI ⚡_`
    );
  },
};

// ── .clearwarn ────────────────────────────────────────────────────────────────
const clearwarnCmd = {
  name:    'clearwarn',
  aliases: ['resetwarn', 'unwarn'],
  description: '(Owner) Clear all warnings for a user',
  category: 'owner',

  execute: async ({ sock, from, sender, args, msg, isOwner, isGroup, reply }) => {
    if (!isGroup)  return reply('👥 Groups only.');
    if (!isOwner)  return reply(config.messages.ownerOnly);

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0] || null;
    if (!target) return reply('Usage: *.clearwarn @user*');

    const targetNum = target.split('@')[0];
    clearWarns(target);
    await reply(`✅ All warnings for @${targetNum} have been cleared.\n\n_Nova AI ⚡_`);
  },
};

module.exports = [warnCmd, warnsCmd, clearwarnCmd];
