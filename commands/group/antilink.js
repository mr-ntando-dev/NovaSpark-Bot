/**
 * ⚡ NovaSpark Bot v7 — AntiLink (Enhanced)
 * Blocks WhatsApp invite links, ALL URLs, and shortened URLs in groups
 *
 * NEW in v7:
 * ✅ Whitelist support (allow specific domains)
 * ✅ Detects shortened URLs: bit.ly, t.co, tinyurl, rb.gy, cutt.ly, etc.
 * ✅ Detects WA group invite links: chat.whatsapp.com
 * ✅ 3 actions: delete | warn | kick
 * ✅ Per-group whitelist stored in DB
 *
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// Known URL shortener domains
const SHORT_URL_PATTERNS = [
  'bit.ly', 't.co', 'tinyurl.com', 'rb.gy', 'cutt.ly', 'ow.ly', 'is.gd',
  'buff.ly', 'adf.ly', 'bc.vc', 'tiny.cc', 'shorte.st', 'clck.ru',
  'lnkd.in', 'goo.gl', 'gg.gg', 'v.gd', 'shorturl.at', 'snip.ly',
];

const WA_INVITE_REGEX = /chat\.whatsapp\.com\/[A-Za-z0-9]+/i;
const URL_REGEX       = /(?:https?:\/\/|www\.)\S+/gi;
const SHORT_REGEX     = new RegExp(
  '(?:https?:\\/\\/)?(?:' +
  SHORT_URL_PATTERNS.map(d => d.replace('.', '\\.')).join('|') +
  ')\\/\\S+',
  'gi'
);

function detectLinks(body) {
  const urlMatches   = body.match(URL_REGEX)          || [];
  const shortMatches = body.match(SHORT_REGEX)         || [];
  const waMatches    = WA_INVITE_REGEX.test(body)      ? ['[WA invite link]'] : [];
  return [...new Set([...urlMatches, ...shortMatches, ...waMatches])];
}

function isWhitelisted(link, whitelist) {
  if (!whitelist || whitelist.length === 0) return false;
  return whitelist.some(domain => link.toLowerCase().includes(domain.toLowerCase()));
}

module.exports = {
  name: 'antilink',
  aliases: ['linkblock', 'linkprotect'],
  category: 'group',
  description: 'Block all links/URLs in group (with whitelist support)',
  usage: '.antilink on | off | set <delete|warn|kick> | whitelist add/remove/list | get',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute({ sock, msg, from, args, reply }) {
    try {
      const opt = (args[0] || '').toLowerCase();
      const s   = database.getGroupSettings(from);
      const wl  = s.antilinkWhitelist || [];

      if (!opt || opt === 'get') {
        return reply(
          '*🔗 AntiLink v7 — NovaSpark*\n\n' +
          'Status     : *' + (s.antilink ? '🟢 ON' : '🔴 OFF') + '*\n' +
          'Action     : *' + (s.antilinkAction || 'delete') + '*\n' +
          'Whitelist  : *' + wl.length + '* domain(s)\n' +
          'Short URLs : *Detected* ✅\n' +
          'WA Links   : *Detected* ✅\n\n' +
          'Commands:\n' +
          '  .antilink on / off\n' +
          '  .antilink set delete | warn | kick\n' +
          '  .antilink whitelist add <domain>\n' +
          '  .antilink whitelist remove <domain>\n' +
          '  .antilink whitelist list'
        );
      }
      if (opt === 'on') {
        database.updateGroupSettings(from, { antilink: true });
        return reply('🔗 *AntiLink is now ON* — all links blocked (whitelist specific domains to allow them).');
      }
      if (opt === 'off') {
        database.updateGroupSettings(from, { antilink: false });
        return reply('🔗 *AntiLink is now OFF*.');
      }
      if (opt === 'set') {
        const action = (args[1] || '').toLowerCase();
        if (!['delete', 'warn', 'kick'].includes(action)) {
          return reply('❌ Valid actions: *delete* | *warn* | *kick*');
        }
        database.updateGroupSettings(from, { antilinkAction: action, antilink: true });
        return reply('🔗 *AntiLink action set to* `' + action + '` and *turned ON*.');
      }
      if (opt === 'whitelist') {
        const sub    = (args[1] || '').toLowerCase();
        const domain = (args[2] || '').toLowerCase().replace(/https?:\/\//, '').split('/')[0];
        if (sub === 'add') {
          if (!domain) return reply('❌ Provide a domain. Example: .antilink whitelist add google.com');
          if (wl.includes(domain)) return reply('⚠️ *' + domain + '* is already whitelisted.');
          wl.push(domain);
          database.updateGroupSettings(from, { antilinkWhitelist: wl });
          return reply('✅ *' + domain + '* added to antilink whitelist.');
        }
        if (sub === 'remove') {
          if (!domain) return reply('❌ Provide a domain to remove.');
          const idx = wl.indexOf(domain);
          if (idx === -1) return reply('⚠️ *' + domain + '* not found in whitelist.');
          wl.splice(idx, 1);
          database.updateGroupSettings(from, { antilinkWhitelist: wl });
          return reply('✅ *' + domain + '* removed from whitelist.');
        }
        if (sub === 'list') {
          if (wl.length === 0) return reply('📋 Whitelist is empty. All links are blocked when antilink is ON.');
          return reply('📋 *Whitelisted Domains:*\n\n' + wl.map(d => '• ' + d).join('\n'));
        }
        return reply('❓ Usage: .antilink whitelist add/remove/list <domain>');
      }
      return reply('❓ Usage: `.antilink on | off | set <action> | whitelist add/remove/list <domain> | get`');
    } catch (e) {
      await reply('❌ Error: ' + e.message);
    }
  },

  async check(sock, msg, from, groupSettings) {
    if (!groupSettings.antilink) return false;
    const body = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || ''
    ).trim();
    if (!body) return false;

    const links = detectLinks(body);
    if (links.length === 0) return false;

    const whitelist    = groupSettings.antilinkWhitelist || [];
    const blockedLinks = links.filter(l => !isWhitelisted(l, whitelist));
    if (blockedLinks.length === 0) return false;

    const sender = msg.key.participant || msg.key.remoteJid;
    const action = groupSettings.antilinkAction || 'delete';
    const tag    = '@' + sender.split('@')[0];

    try { await sock.sendMessage(from, { delete: msg.key }); } catch {}

    if (action === 'warn') {
      const warns = database.addWarn ? database.addWarn(from, sender) : 1;
      await sock.sendMessage(from, {
        text: '⚠️ ' + tag + ' — no links allowed in this group! Warn #' + warns + '.',
        mentions: [sender],
      });
    } else if (action === 'kick') {
      await sock.sendMessage(from, {
        text: '🚫 ' + tag + ' was removed for sending a link.',
        mentions: [sender],
      });
      try { await sock.groupParticipantsUpdate(from, [sender], 'remove'); } catch {}
    }
    return true;
  },
};
