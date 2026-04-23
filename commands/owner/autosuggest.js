/**
 * ⚡ NovaSpark Bot v8.0 — Auto Command Suggestions
 * When a user types something that looks like a wrong/misspelled command,
 * the bot silently suggests the correct one via a quoted reply.
 * .autosuggest on/off
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');
const config   = require('../../config');

// Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m+1 }, (_, i) => Array.from({ length: n+1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

const ALL_COMMANDS = [
  'menu','help','gpt','gemini','imagine','sticker','tts','translate','weather','news',
  'qr','calc','bmi','time','wordle','trivia','hangman','rps','tiktok','yt','removebg',
  'truth','dare','compliment','insult','motivate','profile','ship','fact','urban',
  'roast','joke','meme','riddle','poll','currency','math','essay','homework',
  'summarize','studytips','botstats','warn','kick','promote','demote','mute','unmute',
  'tagall','antilink','antitoxic','nightmode','vip','ghost','stealth','autoreact',
  'welcome','goodbye','groupstats','broadcast','setpremium','antidelete','autoschedule',
  'autoforward','autopin','autotranslate','autonuke','birthday','autopollclose','autoquote',
  'textart','zip','botzip',
];

module.exports = {
  name: 'autosuggest',
  aliases: ['suggest', 'cmdhelp'],
  description: 'Auto-suggest correct commands when user types wrong ones',
  category: 'owner',
  ownerOnly: false,

  onMessage: async ({ sock, msg, from, text, sender }) => {
    if (!text) return;
    const P = config.prefix || '.';
    if (!text.startsWith(P)) return;

    const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
    // Check global setting too
    const globalOn = database.getGlobalSetting ? database.getGlobalSetting('autoSuggest') : true;
    if (gs.autoSuggest === false || globalOn === false) return;

    const typed = text.slice(P.length).split(' ')[0].toLowerCase();
    if (ALL_COMMANDS.includes(typed)) return; // correct command, skip

    // Find closest match
    const scored = ALL_COMMANDS.map(cmd => ({ cmd, dist: levenshtein(typed, cmd) }));
    scored.sort((a, b) => a.dist - b.dist);
    const best = scored[0];

    // Only suggest if reasonably close (dist ≤ 3 and word length isn't too short)
    if (best.dist > 3 || typed.length < 2) return;

    await sock.sendMessage(from, {
      text: `💡 Did you mean *${P}${best.cmd}*?\n\n_Type \`${P}menu\` to see all commands._`,
    }, { quoted: msg });
  },

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();
    if (sub === 'on') {
      database.updateGroupSettings(from, { autoSuggest: true });
      return reply('💡 *Auto Command Suggestions: ON*\n\nWhen someone types a wrong command, I\'ll politely suggest the correct one.');
    }
    if (sub === 'off') {
      database.updateGroupSettings(from, { autoSuggest: false });
      return reply('💡 *Auto Command Suggestions: OFF*');
    }

    const gs = database.getGroupSettings(from);
    return reply(
      '💡 *Auto Command Suggestions*\n\n' +
      `Status: *${gs.autoSuggest !== false ? 'ON ✅' : 'OFF ❌'}*\n\n` +
      'When a user types a wrong command (like `.mnu` instead of `.menu`), I suggest the correct one.\n\n' +
      '`.autosuggest on/off` — Toggle'
    );
  },
};
