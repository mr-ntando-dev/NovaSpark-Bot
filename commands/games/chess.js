/**
 * ⚡ NovaSpark v9 — Text Chess
 * .chess start @user — Challenge someone
 * .chess move e2e4 — Make a move (algebraic coords)
 * .chess resign — Forfeit the game
 * .chess board — View current board
 * Fully playable chess in WhatsApp. Per-group sessions.
 * By Dev-Ntando
 */
'use strict';

// board[row][col] — row 0 = rank 8, row 7 = rank 1
// Uppercase = White, lowercase = Black
const INIT_BOARD = () => [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['.','.','.','.','.','.','.','.',],
  ['.','.','.','.','.','.','.','.',],
  ['.','.','.','.','.','.','.','.',],
  ['.','.','.','.','.','.','.','.',],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R'],
];

const PIECES = {
  'K':'♔','Q':'♕','R':'♖','B':'♗','N':'♘','P':'♙',
  'k':'♚','q':'♛','r':'♜','b':'♝','n':'♞','p':'♟',
  '.':'·'
};

const sessions = new Map(); // groupId → { board, white, black, turn, moveCount }

function boardToText(board) {
  const cols = '  a b c d e f g h';
  let out = cols + '\n';
  for (let r = 0; r < 8; r++) {
    out += `${8 - r} `;
    for (let c = 0; c < 8; c++) {
      const isLight = (r + c) % 2 === 0;
      const piece = PIECES[board[r][c]] || '·';
      out += piece + ' ';
    }
    out += `${8 - r}\n`;
  }
  out += cols;
  return out;
}

function colToIndex(ch) { return ch.charCodeAt(0) - 97; } // a→0
function rowToIndex(n)  { return 8 - parseInt(n); }       // 8→0, 1→7

function isWhite(p) { return p >= 'A' && p <= 'Z' && p !== '.'; }
function isBlack(p) { return p >= 'a' && p <= 'z' && p !== '.'; }
function isEmpty(p) { return p === '.'; }

function validMove(board, fr, fc, tr, tc, whiteTurn) {
  const piece = board[fr][fc];
  if (piece === '.') return false;
  const myPiece = whiteTurn ? isWhite(piece) : isBlack(piece);
  if (!myPiece) return false;
  const target = board[tr][tc];
  const captureOwn = whiteTurn ? isWhite(target) : isBlack(target);
  if (captureOwn) return false;
  // Basic movement rules (simplified — no check detection)
  const p = piece.toUpperCase();
  const dr = tr - fr, dc = tc - fc;
  if (p === 'P') {
    const dir = whiteTurn ? -1 : 1;
    const startRow = whiteTurn ? 6 : 1;
    if (dc === 0 && dr === dir && isEmpty(target)) return true;
    if (dc === 0 && dr === 2 * dir && fr === startRow && isEmpty(board[fr + dir][fc]) && isEmpty(target)) return true;
    if (Math.abs(dc) === 1 && dr === dir && !isEmpty(target)) return true;
    return false;
  }
  if (p === 'N') return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
  if (p === 'K') return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  if (p === 'R') {
    if (dr !== 0 && dc !== 0) return false;
    return pathClear(board, fr, fc, tr, tc);
  }
  if (p === 'B') {
    if (Math.abs(dr) !== Math.abs(dc)) return false;
    return pathClear(board, fr, fc, tr, tc);
  }
  if (p === 'Q') {
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
    return pathClear(board, fr, fc, tr, tc);
  }
  return false;
}

function pathClear(board, fr, fc, tr, tc) {
  const sr = Math.sign(tr - fr), sc = Math.sign(tc - fc);
  let r = fr + sr, c = fc + sc;
  while (r !== tr || c !== tc) {
    if (board[r][c] !== '.') return false;
    r += sr; c += sc;
  }
  return true;
}

function applyMove(board, fr, fc, tr, tc) {
  const nb = board.map(r => [...r]);
  nb[tr][tc] = nb[fr][fc];
  nb[fr][fc] = '.';
  // Pawn promotion
  if (nb[tr][tc] === 'P' && tr === 0) nb[tr][tc] = 'Q';
  if (nb[tr][tc] === 'p' && tr === 7) nb[tr][tc] = 'q';
  return nb;
}

module.exports = {
  name: 'chess',
  aliases: ['play chess'],
  description: '♟️ Play chess in WhatsApp',
  category: 'games',

  execute: async ({ sock, msg, from, sender, args, reply, isGroup }) => {
    if (!isGroup) return reply('♟️ Chess can only be played in groups!');
    const sub = (args[0] || '').toLowerCase();
    const senderNum = sender.split('@')[0];

    // ── .chess start @user ───────────────────────────────────────────────────
    if (sub === 'start') {
      if (sessions.has(from)) return reply('♟️ A chess game is already in progress! Use *.chess resign* to end it.');
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!mentioned || mentioned === sender) return reply('♟️ Mention a player to challenge: *.chess start @user*');
      const oppNum = mentioned.split('@')[0];
      sessions.set(from, {
        board: INIT_BOARD(),
        white: sender,
        black: mentioned,
        turn: 'white',
        moveCount: 0,
        startTime: Date.now(),
      });
      const s = sessions.get(from);
      return reply(
        `♟️ *Chess Game Started!*\n\n` +
        `♔ White: @${senderNum}\n♚ Black: @${oppNum}\n\n` +
        `White moves first! Use *.chess move e2e4*\n\n` +
        `\`\`\`\n${boardToText(s.board)}\n\`\`\``
      );
    }

    // ── .chess board ─────────────────────────────────────────────────────────
    if (sub === 'board') {
      const s = sessions.get(from);
      if (!s) return reply('♟️ No active chess game. Start one with *.chess start @user*');
      const turnName = s.turn === 'white' ? `@${s.white.split('@')[0]}` : `@${s.black.split('@')[0]}`;
      return reply(
        `♟️ *Chess Board*  —  Move ${s.moveCount + 1}\n` +
        `Turn: ${s.turn === 'white' ? '♔ White' : '♚ Black'} (${turnName})\n\n` +
        `\`\`\`\n${boardToText(s.board)}\n\`\`\``
      );
    }

    // ── .chess resign ────────────────────────────────────────────────────────
    if (sub === 'resign') {
      const s = sessions.get(from);
      if (!s) return reply('♟️ No active chess game.');
      if (sender !== s.white && sender !== s.black) return reply('♟️ You are not in this game!');
      const winner = sender === s.white ? `@${s.black.split('@')[0]}` : `@${s.white.split('@')[0]}`;
      sessions.delete(from);
      return reply(`♟️ *@${senderNum} resigned!* ${winner} wins! 🏆`);
    }

    // ── .chess move e2e4 ─────────────────────────────────────────────────────
    if (sub === 'move') {
      const s = sessions.get(from);
      if (!s) return reply('♟️ No active chess game. Start with *.chess start @user*');
      const player = s.turn === 'white' ? s.white : s.black;
      if (sender !== player) return reply(`♟️ It's not your turn! Wait for @${player.split('@')[0]}.`);

      const moveStr = (args[1] || '').toLowerCase().trim();
      if (!/^[a-h][1-8][a-h][1-8]$/.test(moveStr)) {
        return reply('♟️ Invalid move format. Use: *.chess move e2e4* (from-to in algebraic notation)');
      }
      const fc = colToIndex(moveStr[0]), fr = rowToIndex(moveStr[1]);
      const tc = colToIndex(moveStr[2]), tr = rowToIndex(moveStr[3]);

      if (!validMove(s.board, fr, fc, tr, tc, s.turn === 'white')) {
        return reply(`♟️ Illegal move: *${moveStr}*. Try again.`);
      }

      s.board = applyMove(s.board, fr, fc, tr, tc);
      s.turn = s.turn === 'white' ? 'black' : 'white';
      s.moveCount++;

      // Basic king-capture check (game over)
      const kings = s.board.flat().filter(p => p === 'K' || p === 'k');
      if (!kings.includes('K')) {
        sessions.delete(from);
        return reply(`♟️ *Checkmate!* ♚ Black wins! 🏆\n\n\`\`\`\n${boardToText(s.board)}\n\`\`\``);
      }
      if (!kings.includes('k')) {
        sessions.delete(from);
        return reply(`♟️ *Checkmate!* ♔ White wins! 🏆\n\n\`\`\`\n${boardToText(s.board)}\n\`\`\``);
      }

      const nextPlayer = s.turn === 'white' ? s.white : s.black;
      return reply(
        `♟️ *Move ${s.moveCount}:* ${moveStr.toUpperCase()} ✅\n` +
        `Next: ${s.turn === 'white' ? '♔ White' : '♚ Black'} (@${nextPlayer.split('@')[0]})\n\n` +
        `\`\`\`\n${boardToText(s.board)}\n\`\`\``
      );
    }

    // Default help
    return reply(
      `♟️ *Chess Commands*\n\n` +
      `*.chess start @user* — Challenge someone\n` +
      `*.chess move e2e4* — Make a move (from→to)\n` +
      `*.chess board* — View current board\n` +
      `*.chess resign* — Give up`
    );
  },
};
