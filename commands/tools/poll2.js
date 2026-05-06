/**
 * ⚡ NovaSpark v9 — Advanced Text Poll
 * .poll2 "Question" "Option A" "Option B" "Option C"
 * .vote 1/2/3 — Cast your vote
 * .pollresults — See live results
 * .closepoll — End poll and announce winner (admin)
 * Supports up to 5 options. Per-group. One vote per user.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const activePollKey = (gid) => `poll2_${gid}`;

module.exports = [
  {
    name: 'poll2',
    aliases: ['createpoll', 'newpoll'],
    description: '📊 Create an advanced text poll with live voting',
    category: 'tools',
    adminOnly: true,

    execute: async ({ from, args, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Only admins can create polls.');

      // Parse quoted args: "Question" "A" "B" "C"
      const raw = args.join(' ');
      const parts = [...raw.matchAll(/"([^"]+)"/g)].map(m => m[1]);

      if (parts.length < 3) {
        return reply(
          '📊 *Create a Poll*\n\n' +
          'Usage: *.poll2 "Question" "Option A" "Option B" "Option C"*\n\n' +
          'Example:\n' +
          '*.poll2 "Best pizza topping?" "Cheese" "Pepperoni" "Veggies"*\n\n' +
          'Minimum 2 options, max 5.'
        );
      }

      const question = parts[0];
      const options = parts.slice(1, 6);
      if (options.length > 5) return reply('📊 Maximum 5 options allowed.');

      const poll = {
        question,
        options,
        votes: {}, // jid → optionIndex
        createdAt: Date.now(),
        open: true,
      };

      if (database.setSetting) database.setSetting(activePollKey(from), poll);

      const optLines = options.map((o, i) => `  *${i + 1}.* ${o}`).join('\n');
      return reply(
        `📊 *Poll Created!*\n\n` +
        `❓ *${question}*\n\n` +
        `${optLines}\n\n` +
        `Vote: *.vote 1* (or 2, 3...)\n` +
        `Results: *.pollresults*\n` +
        `Close: *.closepoll* (admin)`
      );
    },
  },

  {
    name: 'vote',
    aliases: ['pollvote'],
    description: '🗳️ Vote in the active poll',
    category: 'tools',

    execute: async ({ from, sender, args, reply }) => {
      const poll = database.getSetting ? database.getSetting(activePollKey(from)) : null;
      if (!poll || !poll.open) return reply('📊 No active poll. Create one with *.poll2*');

      const choice = parseInt(args[0]);
      if (isNaN(choice) || choice < 1 || choice > poll.options.length) {
        return reply(`🗳️ Vote with *.vote 1* to *.vote ${poll.options.length}*`);
      }

      const jid = sender;
      if (poll.votes[jid] !== undefined) {
        return reply(`🗳️ You already voted for *${poll.options[poll.votes[jid]]}*. One vote per person!`);
      }

      poll.votes[jid] = choice - 1;
      if (database.setSetting) database.setSetting(activePollKey(from), poll);

      return reply(`✅ Vote cast for *${poll.options[choice - 1]}*!`);
    },
  },

  {
    name: 'pollresults',
    aliases: ['results', 'pollstats'],
    description: '📊 See live poll results',
    category: 'tools',

    execute: async ({ from, reply }) => {
      const poll = database.getSetting ? database.getSetting(activePollKey(from)) : null;
      if (!poll) return reply('📊 No active poll. Create one with *.poll2*');

      const total = Object.keys(poll.votes).length;
      const counts = poll.options.map((_, i) => Object.values(poll.votes).filter(v => v === i).length);
      const max = Math.max(...counts);

      const bars = poll.options.map((opt, i) => {
        const n = counts[i];
        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
        const crown = n === max && total > 0 ? ' 👑' : '';
        return `*${i + 1}. ${opt}*${crown}\n  ${bar} ${pct}% (${n} votes)`;
      });

      return reply(
        `📊 *Poll Results*\n\n` +
        `❓ ${poll.question}\n\n` +
        `${bars.join('\n\n')}\n\n` +
        `👥 Total votes: *${total}*\n` +
        `Status: ${poll.open ? '🟢 Open' : '🔴 Closed'}`
      );
    },
  },

  {
    name: 'closepoll',
    aliases: ['endpoll'],
    description: '🔒 Close the active poll and announce winner',
    category: 'tools',
    adminOnly: true,

    execute: async ({ from, reply, isAdmin, isOwner }) => {
      if (!isAdmin && !isOwner) return reply('🛡️ Admins only!');
      const poll = database.getSetting ? database.getSetting(activePollKey(from)) : null;
      if (!poll || !poll.open) return reply('📊 No open poll to close.');

      poll.open = false;
      if (database.setSetting) database.setSetting(activePollKey(from), poll);

      const total = Object.keys(poll.votes).length;
      const counts = poll.options.map((_, i) => Object.values(poll.votes).filter(v => v === i).length);
      const maxVotes = Math.max(...counts);
      const winners = poll.options.filter((_, i) => counts[i] === maxVotes);

      const resultLines = poll.options.map((opt, i) => {
        const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
        return `  ${counts[i] === maxVotes ? '👑' : '  '} *${opt}* — ${counts[i]} votes (${pct}%)`;
      });

      return reply(
        `🔒 *Poll Closed!*\n\n` +
        `❓ ${poll.question}\n\n` +
        `${resultLines.join('\n')}\n\n` +
        `🏆 *Winner: ${winners.join(' & ')}*\n` +
        `👥 Total votes: *${total}*`
      );
    },
  },
];
