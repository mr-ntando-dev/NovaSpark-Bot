/**
 * ⚡ NovaSpark Bot v11 — .setmenu command
 * Let the owner switch between multiple advanced menu styles.
 * Styles: neon (default), minimal, list, embed, compact, fancy
 * By Dev-Ntando
 */
'use strict';

const config   = require('../../config');
const database = require('../../database');

const VALID_STYLES = ['neon', 'minimal', 'list', 'embed', 'compact', 'fancy'];

const STYLE_DESCRIPTIONS = {
  neon:    '⚡ NEON-MD  — Full boxed menu with image + all categories (default)',
  minimal: '📋 Minimal  — Clean numbered categories, text-only, very fast',
  list:    '📑 List     — WhatsApp native list/button interactive menu',
  embed:   '🖼️  Embed    — Image + short caption with category count badges',
  compact: '⚡ Compact  — Single-column condensed list, no section dividers',
  fancy:   '🌟 Fancy    — Emoji-heavy bold headers, star borders, colourful',
};

module.exports = {
  name:        'setmenu',
  aliases:     ['menutype', 'menustyle'],
  description: 'Owner: switch the bot menu style',
  category:    'owner',
  ownerOnly:   true,

  execute: async ({ sock, msg, from, sender, args, reply }) => {
    const style = (args[0] || '').toLowerCase().trim();

    // ── Show current + all available ────────────────────────────────────────
    if (!style || style === 'list') {
      const current = database.getSetting('menuStyle') || 'neon';
      const lines = [
        `🎨 *Menu Style Manager*`,
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📌 *Current style:* \`${current}\``,
        ``,
        `*Available styles:*`,
        ...VALID_STYLES.map(s => `  ${s === current ? '✅' : '▫️'} \`${s}\` — ${STYLE_DESCRIPTIONS[s]}`),
        ``,
        `*Usage:* \`.setmenu <style>\``,
        `*Example:* \`.setmenu fancy\``,
        ``,
        `_Type_ \`.menu\` _after switching to preview the new style._`,
      ].join('\n');
      return reply(lines);
    }

    if (!VALID_STYLES.includes(style)) {
      return reply(
        `❌ Unknown style *"${style}"*.\n\nValid styles: ${VALID_STYLES.map(s => `\`${s}\``).join(', ')}\n\nRun \`.setmenu\` to see descriptions.`
      );
    }

    database.setSetting('menuStyle', style);

    await sock.sendMessage(from, {
      text: [
        `✅ *Menu style set to:* \`${style}\``,
        ``,
        STYLE_DESCRIPTIONS[style],
        ``,
        `_Type_ \`.menu\` _to preview the new style._`,
      ].join('\n'),
    }, { quoted: msg });
  },
};
