/**
 * ⚡ NovaSpark v9 — Group Coinflip Bet
 * .coinflip heads/tails — Flip a coin
 * .bet heads 500 — Bet your group coins on heads/tails
 * .wallet — Check your coin balance
 * .transfer @user 100 — Send coins to someone
 * .richlist — Group coin leaderboard
 * Virtual coins, no real money involved.
 * By Dev-Ntando
 */
'use strict';
const database = require('../../database');

const WALLET_KEY = (gid) => `wallet_${gid}`;
const STARTING_BALANCE = 1000;

function getWallet(gid) {
  return database.getSetting ? (database.getSetting(WALLET_KEY(gid)) || {}) : {};
}
function saveWallet(gid, obj) {
  if (database.setSetting) database.setSetting(WALLET_KEY(gid), obj);
}
function getBalance(gid, jid) {
  const w = getWallet(gid);
  if (w[jid] === undefined) w[jid] = STARTING_BALANCE;
  return w[jid];
}
function setBalance(gid, jid, amount) {
  const w = getWallet(gid);
  w[jid] = amount;
  saveWallet(gid, w);
}

module.exports = [
  {
    name: 'coinflip',
    aliases: ['flip2', 'toss'],
    description: '🪙 Flip a coin — heads or tails',
    category: 'fun',
    execute: async ({ args, reply }) => {
      const choice = (args[0] || '').toLowerCase();
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const emoji  = result === 'heads' ? '🪙' : '🔄';
      if (!choice) {
        return reply(`${emoji} *${result.toUpperCase()}!*\n\nBet on it: *.bet heads 100* or *.bet tails 100*`);
      }
      if (!['heads','tails'].includes(choice)) return reply('🪙 Use *.coinflip heads* or *.coinflip tails*');
      const won = choice === result;
      return reply(
        `🪙 *Coin Flip!*\n\n` +
        `Your call: *${choice.toUpperCase()}*\n` +
        `Result: *${result.toUpperCase()}* ${emoji}\n\n` +
        (won ? '✅ *Correct!*' : '❌ *Wrong!*') +
        '\n\nBet coins: *.bet heads 100*'
      );
    },
  },

  {
    name: 'bet',
    aliases: ['gamble', 'wager'],
    description: '💰 Bet group coins on a coin flip',
    category: 'fun',
    execute: async ({ from, sender, args, reply }) => {
      const side   = (args[0] || '').toLowerCase();
      const amount = parseInt(args[1]);
      if (!['heads','tails'].includes(side) || isNaN(amount) || amount < 1) {
        return reply('💰 Usage: *.bet heads 100* or *.bet tails 500*');
      }
      const balance = getBalance(from, sender);
      if (amount > balance) return reply(`❌ Not enough coins! You have *${balance} 🪙*`);

      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = side === result;
      const newBalance = won ? balance + amount : balance - amount;
      setBalance(from, sender, newBalance);

      return reply(
        `🪙 *Coin Bet!*\n\n` +
        `Your bet: *${side.toUpperCase()}* for *${amount} coins*\n` +
        `Result: *${result.toUpperCase()}*\n\n` +
        (won ? `✅ *You WON!* +${amount} coins` : `❌ *You LOST!* -${amount} coins`) + '\n' +
        `💰 Balance: *${newBalance} 🪙*`
      );
    },
  },

  {
    name: 'wallet',
    aliases: ['balance', 'coins', 'mycoins'],
    description: '💰 Check your group coin balance',
    category: 'tools',
    execute: async ({ from, sender, reply }) => {
      const balance = getBalance(from, sender);
      return reply(`💰 *Your Wallet*\n\n🪙 Balance: *${balance} coins*\n\nBet: *.bet heads 100*\nTransfer: *.transfer @user 100*`);
    },
  },

  {
    name: 'transfer',
    aliases: ['send', 'pay', 'give'],
    description: '💸 Transfer coins to another member',
    category: 'tools',
    execute: async ({ from, sender, msg, args, reply }) => {
      const amount = parseInt(args[args.length - 1]);
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target || isNaN(amount) || amount < 1) {
        return reply('💸 Usage: *.transfer @user 100*');
      }
      if (target === sender) return reply('💸 You can\'t transfer to yourself!');
      const myBalance = getBalance(from, sender);
      if (amount > myBalance) return reply(`❌ Not enough coins! You have *${myBalance} 🪙*`);
      setBalance(from, sender, myBalance - amount);
      setBalance(from, target, getBalance(from, target) + amount);
      return reply(
        `💸 *Transfer Sent!*\n\n` +
        `Sent *${amount} 🪙* to @${target.split('@')[0]}\n` +
        `Your balance: *${myBalance - amount} 🪙*`
      );
    },
  },

  {
    name: 'richlist',
    aliases: ['topcoins', 'coinleaderboard'],
    description: '💰 Group coin leaderboard',
    category: 'tools',
    execute: async ({ from, reply }) => {
      const wallet = getWallet(from);
      const sorted = Object.entries(wallet).sort(([,a],[,b]) => b - a).slice(0, 10);
      if (!sorted.length) return reply('💰 No one has coins yet! Bet: *.bet heads 100*');
      const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      const lines = sorted.map(([jid, bal], i) => `${medals[i]} @${jid.split('@')[0]} — *${bal} 🪙*`);
      return reply(`💰 *Coin Rich List*\n\n${lines.join('\n')}`);
    },
  },
];
