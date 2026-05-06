/**
 * ⚡ NovaSpark v9 — XP Leaderboard System
 * Members earn XP for every message sent.
 * .xp — Check your XP and level
 * .leaderboard — Top 10 most active members
 * .level — Check current level info
 * Levels: 1 (0 XP) → 2 (100) → 3 (250) → 5 (500) → 10 (1500)...
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const XP_PER_MSG = 2;
const LEVELS = [
  { level: 1,  min: 0    , title: '🌱 Newcomer'    },
  { level: 2,  min: 100  , title: '🌿 Member'      },
  { level: 3,  min: 300  , title: '⭐ Regular'     },
  { level: 4,  min: 600  , title: '🔥 Active'      },
  { level: 5,  min: 1000 , title: '💎 Champion'    },
  { level: 6,  min: 1500 , title: '🚀 Elite'       },
  { level: 7,  min: 2500 , title: '👑 Legend'      },
  { level: 8,  min: 4000 , title: '⚡ NovaSpark'   },
  { level: 9,  min: 6000 , title: '🧠 Mastermind'  },
  { level: 10, min: 10000, title: '🌌 Godlike'     },
];

function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.min) lvl = l; else break; }
  return lvl;
}
function getNextLevel(xp) {
  const idx = LEVELS.findIndex(l => xp < l.min);
  return idx === -1 ? null : LEVELS[idx];
}

const XP_KEY = (gid) => `xp_${gid}`;

function getGroupXP(gid) {
  return database.getSetting ? (database.getSetting(XP_KEY(gid)) || {}) : {};
}
function saveGroupXP(gid, obj) {
  if (database.setSetting) database.setSetting(XP_KEY(gid), obj);
}

module.exports = {
  name: 'xp',
  aliases: ['level', 'myxp', 'rank'],
  description: '⭐ Check your XP and level in this group',
  category: 'tools',

  // Called from handler.js on every message
  addXP: (gid, jid) => {
    const xpData = getGroupXP(gid);
    if (!xpData[jid]) xpData[jid] = { xp: 0, msgs: 0 };
    xpData[jid].xp += XP_PER_MSG;
    xpData[jid].msgs += 1;
    saveGroupXP(gid, xpData);
  },

  execute: async ({ from, sender, args, reply, isGroup }) => {
    if (!isGroup) return reply('⭐ XP is tracked per group. Use this command in a group!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'leaderboard' || sub === 'top') {
      const xpData = getGroupXP(from);
      const sorted = Object.entries(xpData)
        .sort(([, a], [, b]) => b.xp - a.xp)
        .slice(0, 10);
      if (!sorted.length) return reply('⭐ No XP data yet. Start chatting!');

      const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      const lines = sorted.map(([jid, d], i) => {
        const num = jid.split('@')[0];
        const lvl = getLevel(d.xp);
        return `${medals[i]} *@${num}* — ${d.xp} XP  ${lvl.title}`;
      });
      return reply(`🏆 *Group Leaderboard — Top ${sorted.length}*\n\n${lines.join('\n')}`);
    }

    // .xp — show your own
    const xpData = getGroupXP(from);
    const d = xpData[sender] || { xp: 0, msgs: 0 };
    const lvl = getLevel(d.xp);
    const next = getNextLevel(d.xp);
    const progressBar = next
      ? (() => {
          const pct = Math.min(1, (d.xp - lvl.min) / (next.min - lvl.min));
          const filled = Math.round(pct * 15);
          return '█'.repeat(filled) + '░'.repeat(15 - filled) + ` ${Math.round(pct * 100)}%`;
        })()
      : '████████████████ MAX';

    return reply(
      `⭐ *Your XP — ${from.split('@')[0]}*\n\n` +
      `👤 @${sender.split('@')[0]}\n` +
      `🎖️ Level: *${lvl.level}* — ${lvl.title}\n` +
      `✨ XP: *${d.xp}*\n` +
      `💬 Messages: *${d.msgs}*\n\n` +
      `Progress to Lv.${next ? next.level : lvl.level}:\n[${progressBar}]\n` +
      (next ? `Next: *${next.title}* at ${next.min} XP (need ${next.min - d.xp} more)` : '🌌 *MAX LEVEL REACHED!*') + '\n\n' +
      `*.xp leaderboard* — Group top 10`
    );
  },
};
