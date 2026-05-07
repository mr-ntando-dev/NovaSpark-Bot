/**
 * ⚡ NovaSpark Bot v8.0 — Auto Poll Closer
 * .autopollclose on/off   — Auto-close polls after set duration
 * .autopollclose time <minutes>  — Set poll auto-close time
 * .autopollclose results  — Show results of last closed poll
 * Automatically announces poll results and closes voting
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

// In-memory poll tracker: { msgId: { from, question, options, votes, closeAt, announced } }
const activePollsMap = new Map();

module.exports = {
  name: 'autopollclose',
  aliases: ['pollclose', 'pollresult', 'autopollstats'],
  description: 'Auto-close polls and announce results after set time',
  category: 'owner',
  ownerOnly: false,

  onPollUpdate: async ({ sock, pollUpdate, from }) => {
    // Track votes from poll update events
    const { pollCreationMessageKey, votes } = pollUpdate;
    if (!activePollsMap.has(pollCreationMessageKey?.id)) return;
    const poll = activePollsMap.get(pollCreationMessageKey.id);
    poll.votes = votes;
  },

  onMessage: async ({ sock, msg, from }) => {
    // Track new polls created in groups
    const pollMsg = msg.message?.pollCreationMessage || msg.message?.pollCreationMessageV2 || msg.message?.pollCreationMessageV3;
    if (!pollMsg) return;

    const gs = database.getGroupSettings ? database.getGroupSettings(from) : {};
    if (!gs.autoPollClose) return;

    const closeInMs = (gs.pollCloseMinutes || 10) * 60_000;
    const pollData = {
      from,
      msgKey: msg.key,
      question: pollMsg.name || 'Poll',
      options: pollMsg.options?.map(o => ({ name: o.optionName, votes: 0 })) || [],
      votes: [],
      closeAt: Date.now() + closeInMs,
      announced: false,
    };
    activePollsMap.set(msg.key.id, pollData);

    // Schedule close announcement
    setTimeout(async () => {
      const p = activePollsMap.get(msg.key.id);
      if (!p || p.announced) return;
      p.announced = true;

      // Tally votes
      const tally = {};
      for (const v of (p.votes || [])) {
        for (const opt of (v.selectedOptions || [])) {
          tally[opt] = (tally[opt] || 0) + 1;
        }
      }

      const total = Object.values(tally).reduce((a, b) => a + b, 0);
      const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
      const resultLines = p.options.map(o => {
        const count = tally[o.name] || 0;
        const pct = total ? Math.round((count / total) * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
        return `${o.name}\n${bar} ${pct}% (${count} vote${count !== 1 ? 's' : ''})`;
      }).join('\n\n');

      const winner = sorted[0]?.[0] || 'No votes';
      await sock.sendMessage(p.from, {
        text: `📊 *Poll Results — "${p.question}"*\n\n${resultLines}\n\n🏆 *Winner: ${winner}*\n\n_Poll automatically closed after ${gs.pollCloseMinutes || 10} minutes._`,
      });

      activePollsMap.delete(msg.key.id);
    }, closeInMs);
  },

  execute: async ({ sock, msg, from, args, reply, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      database.updateGroupSettings(from, { autoPollClose: true });
      const mins = database.getGroupSettings(from).pollCloseMinutes || 10;
      return reply(`📊 *Auto Poll Close: ON*\n\nPolls will auto-close after *${mins} minutes* and results will be announced.`);
    }
    if (sub === 'off') {
      database.updateGroupSettings(from, { autoPollClose: false });
      return reply('📊 *Auto Poll Close: OFF*');
    }
    if (sub === 'time') {
      const mins = parseInt(args[1]);
      if (isNaN(mins) || mins < 1) return reply('❌ Provide minutes. E.g. `.autopollclose time 10`');
      database.updateGroupSettings(from, { pollCloseMinutes: mins });
      return reply(`⏱️ Poll auto-close time set to *${mins} minutes*.`);
    }

    const gs = database.getGroupSettings(from);
    return reply(
      '📊 *Auto Poll Close*\n\n' +
      `Status: *${gs.autoPollClose ? 'ON ✅' : 'OFF ❌'}*\n` +
      `Close After: *${gs.pollCloseMinutes || 10} minutes*\n\n` +
      '`.autopollclose on/off` — Toggle\n' +
      '`.autopollclose time <mins>` — Set duration'
    );
  },
};
