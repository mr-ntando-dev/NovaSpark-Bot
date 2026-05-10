/**
 * ⚡ NovaSpark Bot — Tic Tac Toe (text-based, no API)
 * .ttt start @player  — challenge someone
 * .ttt <1-9>          — make a move
 * .ttt quit           — forfeit the game
 *
 * Board positions:
 *   1 | 2 | 3
 *   4 | 5 | 6
 *   7 | 8 | 9
 */
'use strict';

const database = require('../../database');

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],          // diags
];

function renderBoard(b) {
  const s = (i) => (b[i] === 'X' ? '❌' : b[i] === 'O' ? '⭕' : `${i+1}️⃣`);
  return `${s(0)} ${s(1)} ${s(2)}\n${s(3)} ${s(4)} ${s(5)}\n${s(6)} ${s(7)} ${s(8)}`;
}

function checkWin(b, sym) {
  return WIN_COMBOS.some(([a, c, d]) => b[a] === sym && b[c] === sym && b[d] === sym);
}

function isDraw(b) { return b.every(c => c === 'X' || c === 'O'); }

module.exports = {
  name:    'ttt',
  aliases: ['tictactoe', 'ttt'],
  category: 'games',
  desc:    'Play Tic Tac Toe against another member',
  usage:   '.ttt start @player | .ttt <1-9> | .ttt quit',
  example: '.ttt start @Bob\n.ttt 5',
  async execute({ sock, msg, args, from, sender }) {
    const gs       = database.getGroupSettings(from) || {};
    const sub      = (args[0] || '').toLowerCase();
    const myJid    = sender || msg.key.participant || msg.key.remoteJid;

    // ── .ttt start @player ──────────────────────────────────────────────────
    if (sub === 'start') {
      if (gs.ttt) {
        return sock.sendMessage(from, {
          text: '⚠️ A Tic Tac Toe game is already in progress! Use `.ttt quit` to end it.',
        }, { quoted: msg });
      }
      // Extract mentioned jid
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (args[1] && args[1].replace('@', '') + '@s.whatsapp.net');
      if (!mentioned || mentioned === myJid) {
        return sock.sendMessage(from, {
          text: '❌ Mention someone to challenge.\nUsage: `.ttt start @username`',
        }, { quoted: msg });
      }
      gs.ttt = {
        board:   Array(9).fill(null),
        players: { X: myJid, O: mentioned },
        turn:    'X',
        startedAt: Date.now(),
      };
      database.saveGroupSettings(from, gs);

      const board = renderBoard(gs.ttt.board);
      await sock.sendMessage(from, {
        text: `🎮 *Tic Tac Toe started!*\n\n` +
              `❌ X: @${myJid.split('@')[0]}\n` +
              `⭕ O: @${mentioned.split('@')[0]}\n\n` +
              `${board}\n\n` +
              `*${myJid.split('@')[0]}'s turn (❌)*\n` +
              `Type \`.ttt <1-9>\` to place your mark.`,
        mentions: [myJid, mentioned],
      }, { quoted: msg });
      return;
    }

    // ── .ttt quit ───────────────────────────────────────────────────────────
    if (sub === 'quit') {
      if (!gs.ttt) return sock.sendMessage(from, { text: '❌ No game in progress.' }, { quoted: msg });
      const g = gs.ttt;
      const isPlayer = Object.values(g.players).includes(myJid);
      if (!isPlayer) return sock.sendMessage(from, { text: '❌ You are not in this game.' }, { quoted: msg });
      const winner = myJid === g.players.X ? g.players.O : g.players.X;
      delete gs.ttt;
      database.saveGroupSettings(from, gs);
      return sock.sendMessage(from, {
        text: `🏳️ @${myJid.split('@')[0]} forfeited!\n🏆 @${winner.split('@')[0]} wins by default!`,
        mentions: [myJid, winner],
      }, { quoted: msg });
    }

    // ── .ttt <1-9> ──────────────────────────────────────────────────────────
    const pos = parseInt(args[0]);
    if (!isNaN(pos) && pos >= 1 && pos <= 9) {
      if (!gs.ttt) {
        return sock.sendMessage(from, { text: '❌ No game in progress. Use `.ttt start @player` to begin.' }, { quoted: msg });
      }
      const g = gs.ttt;
      const currentPlayerJid = g.players[g.turn];
      if (myJid !== currentPlayerJid) {
        return sock.sendMessage(from, {
          text: `❌ It's *${currentPlayerJid.split('@')[0]}'s* turn, not yours!`,
        }, { quoted: msg });
      }
      const idx = pos - 1;
      if (g.board[idx] !== null) {
        return sock.sendMessage(from, { text: '❌ That cell is already taken. Choose another position (1-9).' }, { quoted: msg });
      }

      g.board[idx] = g.turn;
      const board = renderBoard(g.board);

      if (checkWin(g.board, g.turn)) {
        delete gs.ttt;
        database.saveGroupSettings(from, gs);
        return sock.sendMessage(from, {
          text: `${board}\n\n🏆 *${currentPlayerJid.split('@')[0]} wins!* (${g.turn === 'X' ? '❌' : '⭕'})\n_GG! Powered by NovaSpark Bot v11_`,
          mentions: [currentPlayerJid],
        }, { quoted: msg });
      }

      if (isDraw(g.board)) {
        delete gs.ttt;
        database.saveGroupSettings(from, gs);
        return sock.sendMessage(from, {
          text: `${board}\n\n🤝 *It's a draw!* Well played both sides.\n_Powered by NovaSpark Bot v11_`,
        }, { quoted: msg });
      }

      g.turn = g.turn === 'X' ? 'O' : 'X';
      database.saveGroupSettings(from, gs);
      const nextJid = g.players[g.turn];
      return sock.sendMessage(from, {
        text: `${board}\n\n*${nextJid.split('@')[0]}'s turn* (${g.turn === 'X' ? '❌' : '⭕'})\nType \`.ttt <1-9>\``,
        mentions: [nextJid],
      }, { quoted: msg });
    }

    // ── Fallback: show help ─────────────────────────────────────────────────
    await sock.sendMessage(from, {
      text: '🎮 *Tic Tac Toe*\n\n' +
            '• `.ttt start @player` — Challenge someone\n' +
            '• `.ttt <1-9>` — Place your mark (positions 1-9)\n' +
            '• `.ttt quit` — Forfeit the game\n\n' +
            'Board positions:\n1️⃣ 2️⃣ 3️⃣\n4️⃣ 5️⃣ 6️⃣\n7️⃣ 8️⃣ 9️⃣',
    }, { quoted: msg });
  },
};
