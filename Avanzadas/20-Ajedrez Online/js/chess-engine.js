// ============================================================
//  chess-engine.js
//  Motor de ajedrez completo en JS puro:
//  movimientos legales, jaque, jaque mate, enroque, al paso,
//  promoción de peón, detección de tablas.
// ============================================================

export const PIECES = {
  wK:'♚', wQ:'♛', wR:'♜', wB:'♝', wN:'♞', wP:'♟',
  bK:'♔', bQ:'♕', bR:'♖', bB:'♗', bN:'♘', bP:'♙',
};

const EMPTY = null;
const W = 'w', B = 'b';

// Posición inicial
const INIT_BOARD = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR'],
];

export class ChessEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.board       = INIT_BOARD.map(r => [...r]);
    this.turn        = W;          // 'w' | 'b'
    this.castling    = { wK:true, wQ:true, bK:true, bQ:true };
    this.enPassant   = null;       // {row, col} square that can be captured en passant
    this.halfMoves   = 0;
    this.fullMoves   = 1;
    this.history     = [];         // array of {from, to, piece, captured, san, ...}
    this.status      = 'playing';  // 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
    this.result      = null;       // 'w' | 'b' | 'draw'
  }

  // ─── Helpers ───────────────────────────────────────────────
  color(piece) { return piece ? piece[0] : null; }
  type(piece)  { return piece ? piece[1] : null; }
  enemy(c)     { return c === W ? B : W; }

  inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  clone() {
    const e = new ChessEngine();
    e.board     = this.board.map(r => [...r]);
    e.turn      = this.turn;
    e.castling  = { ...this.castling };
    e.enPassant = this.enPassant ? { ...this.enPassant } : null;
    e.halfMoves = this.halfMoves;
    e.fullMoves = this.fullMoves;
    e.history   = [...this.history];
    e.status    = this.status;
    e.result    = this.result;
    return e;
  }

  // ─── King position ─────────────────────────────────────────
  findKing(color, board = this.board) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c] === color + 'K') return { row: r, col: c };
    return null;
  }

  // ─── Is square attacked by color? ──────────────────────────
  isAttacked(row, col, byColor, board = this.board) {
    const enemy = byColor;
    // Knights
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const r = row+dr, c = col+dc;
      if (this.inBounds(r,c) && board[r][c] === enemy+'N') return true;
    }
    // Rooks / Queens (straights)
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      let r=row+dr, c=col+dc;
      while (this.inBounds(r,c)) {
        const p = board[r][c];
        if (p) { if (this.color(p)===enemy && (this.type(p)==='R'||this.type(p)==='Q')) return true; break; }
        r+=dr; c+=dc;
      }
    }
    // Bishops / Queens (diagonals)
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let r=row+dr, c=col+dc;
      while (this.inBounds(r,c)) {
        const p = board[r][c];
        if (p) { if (this.color(p)===enemy && (this.type(p)==='B'||this.type(p)==='Q')) return true; break; }
        r+=dr; c+=dc;
      }
    }
    // King
    for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const r=row+dr, c=col+dc;
      if (this.inBounds(r,c) && board[r][c]===enemy+'K') return true;
    }
    // Pawns
    const pawnDir = enemy === W ? 1 : -1; // white pawns attack upward (lower row index)
    for (const dc of [-1,1]) {
      const r=row+pawnDir, c=col+dc;
      if (this.inBounds(r,c) && board[r][c]===enemy+'P') return true;
    }
    return false;
  }

  isInCheck(color, board = this.board) {
    const king = this.findKing(color, board);
    if (!king) return false;
    return this.isAttacked(king.row, king.col, this.enemy(color), board);
  }

  // ─── Pseudo-legal moves for a piece ────────────────────────
  pseudoMoves(row, col, board = this.board) {
    const piece = board[row][col];
    if (!piece) return [];
    const c  = this.color(piece);
    const t  = this.type(piece);
    const moves = [];

    const add = (r, c2) => {
      if (this.inBounds(r, c2) && this.color(board[r][c2]) !== c)
        moves.push({ row, col, toRow: r, toCol: c2 });
    };

    const slide = (dirs) => {
      for (const [dr,dc] of dirs) {
        let r=row+dr, c2=col+dc;
        while (this.inBounds(r,c2)) {
          if (board[r][c2]) { if (this.color(board[r][c2]) !== c) moves.push({row,col,toRow:r,toCol:c2}); break; }
          moves.push({row,col,toRow:r,toCol:c2});
          r+=dr; c2+=dc;
        }
      }
    };

    if (t === 'P') {
      const dir = c === W ? -1 : 1;
      const startRow = c === W ? 6 : 1;
      // Forward
      if (this.inBounds(row+dir, col) && !board[row+dir][col]) {
        moves.push({row, col, toRow:row+dir, toCol:col});
        if (row === startRow && !board[row+2*dir][col])
          moves.push({row, col, toRow:row+2*dir, toCol:col});
      }
      // Captures
      for (const dc of [-1,1]) {
        const r=row+dir, c2=col+dc;
        if (this.inBounds(r,c2)) {
          if (board[r][c2] && this.color(board[r][c2]) !== c)
            moves.push({row,col,toRow:r,toCol:c2});
          // En passant
          if (this.enPassant && this.enPassant.row===r && this.enPassant.col===c2)
            moves.push({row,col,toRow:r,toCol:c2, enPassant:true});
        }
      }
    } else if (t === 'N') {
      for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
        add(row+dr, col+dc);
    } else if (t === 'B') {
      slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
    } else if (t === 'R') {
      slide([[-1,0],[1,0],[0,-1],[0,1]]);
    } else if (t === 'Q') {
      slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
    } else if (t === 'K') {
      for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])
        add(row+dr, col+dc);
      // Castling
      const backRow = c === W ? 7 : 0;
      if (row === backRow && col === 4) {
        // Kingside
        if (this.castling[c+'K'] && !board[backRow][5] && !board[backRow][6] &&
            !this.isAttacked(backRow,4,this.enemy(c),board) &&
            !this.isAttacked(backRow,5,this.enemy(c),board) &&
            !this.isAttacked(backRow,6,this.enemy(c),board))
          moves.push({row,col,toRow:backRow,toCol:6,castling:'K'});
        // Queenside
        if (this.castling[c+'Q'] && !board[backRow][3] && !board[backRow][2] && !board[backRow][1] &&
            !this.isAttacked(backRow,4,this.enemy(c),board) &&
            !this.isAttacked(backRow,3,this.enemy(c),board) &&
            !this.isAttacked(backRow,2,this.enemy(c),board))
          moves.push({row,col,toRow:backRow,toCol:2,castling:'Q'});
      }
    }

    return moves;
  }

  // ─── Legal moves (filter leaving own king in check) ────────
  legalMoves(row, col) {
    const pseudo = this.pseudoMoves(row, col, this.board);
    const color  = this.color(this.board[row][col]);
    return pseudo.filter(m => {
      const b = this.board.map(r => [...r]);
      this._applyToBoard(b, m);
      return !this.isInCheck(color, b);
    });
  }

  // All legal moves for a color
  allLegalMoves(color) {
    const moves = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.color(this.board[r][c]) === color)
          moves.push(...this.legalMoves(r, c));
    return moves;
  }

  // ─── Apply move to a board array ───────────────────────────
  _applyToBoard(board, move) {
    const { row, col, toRow, toCol, castling, enPassant } = move;
    const piece = board[row][col];
    board[toRow][toCol] = piece;
    board[row][col] = EMPTY;

    if (castling === 'K') {
      const backRow = toRow;
      board[backRow][5] = board[backRow][7];
      board[backRow][7] = EMPTY;
    } else if (castling === 'Q') {
      const backRow = toRow;
      board[backRow][3] = board[backRow][0];
      board[backRow][0] = EMPTY;
    }
    if (enPassant) {
      const captureRow = this.color(piece) === W ? toRow + 1 : toRow - 1;
      board[captureRow][toCol] = EMPTY;
    }
  }

  // ─── Make a move (with optional promotion) ─────────────────
  // Returns { ok, needsPromotion, san, captured, ... }
  move(from, to, promoteTo = 'Q') {
    const { row, col } = from;
    const { row: toRow, col: toCol } = to;

    const legal = this.legalMoves(row, col);
    const found = legal.find(m => m.toRow === toRow && m.toCol === toCol);
    if (!found) return { ok: false };

    const piece     = this.board[row][col];
    const color     = this.color(piece);
    const type      = this.type(piece);
    const captured  = this.board[toRow][toCol];

    // Apply to real board
    this._applyToBoard(this.board, found);

    // Promotion
    let promoted = false;
    if (type === 'P' && (toRow === 0 || toRow === 7)) {
      this.board[toRow][toCol] = color + promoteTo;
      promoted = true;
    }

    // Update castling rights
    if (type === 'K') { this.castling[color+'K'] = false; this.castling[color+'Q'] = false; }
    if (piece === 'wR') {
      if (row===7 && col===7) this.castling['wK'] = false;
      if (row===7 && col===0) this.castling['wQ'] = false;
    }
    if (piece === 'bR') {
      if (row===0 && col===7) this.castling['bK'] = false;
      if (row===0 && col===0) this.castling['bQ'] = false;
    }

    // En passant square
    this.enPassant = null;
    if (type === 'P' && Math.abs(toRow - row) === 2)
      this.enPassant = { row: (row + toRow) / 2, col };

    // Half-move clock
    if (type === 'P' || captured) this.halfMoves = 0;
    else this.halfMoves++;

    // Full moves
    if (color === B) this.fullMoves++;

    // Build SAN (simplified)
    const san = this._buildSAN(piece, from, to, found, captured, promoted, promoteTo);

    // Save history
    this.history.push({ from, to, piece, captured, san, castling: found.castling, enPassant: found.enPassant, promoted });

    // Switch turn
    this.turn = this.enemy(color);

    // Update game status
    this._updateStatus();

    return { ok: true, san, captured, promoted, castling: found.castling };
  }

  _buildSAN(piece, from, to, move, captured, promoted, promoteTo) {
    const FILES = 'abcdefgh';
    const type  = this.type(piece);
    if (move.castling === 'K') return 'O-O';
    if (move.castling === 'Q') return 'O-O-O';
    let san = '';
    if (type !== 'P') san += type;
    if (captured || move.enPassant) {
      if (type === 'P') san += FILES[from.col];
      san += 'x';
    }
    san += FILES[to.col] + (8 - to.row);
    if (promoted) san += '=' + promoteTo;
    return san;
  }

  _updateStatus() {
    const moves = this.allLegalMoves(this.turn);
    const inCheck = this.isInCheck(this.turn);

    if (moves.length === 0) {
      if (inCheck) {
        this.status = 'checkmate';
        this.result = this.enemy(this.turn);
      } else {
        this.status = 'stalemate';
        this.result = 'draw';
      }
    } else if (inCheck) {
      this.status = 'check';
    } else if (this.halfMoves >= 100) {
      this.status = 'draw';
      this.result = 'draw';
    } else {
      this.status = 'playing';
    }
  }

  isGameOver() {
    return ['checkmate','stalemate','draw'].includes(this.status);
  }

  // ─── Serialize / Deserialize ────────────────────────────────
  serialize() {
    // Board como objeto anidado para que Firebase no elimine filas vacías (null)
    const boardObj = {};
    for (let r = 0; r < 8; r++) {
      boardObj[r] = {};
      for (let c = 0; c < 8; c++) {
        boardObj[r][c] = this.board[r][c] || '__';  // Firebase borra null, usamos '__' para casilla vacía
      }
    }

    // Limpiar history: reemplazar undefined por null para que Firebase no rechace
    const cleanHistory = this.history.map(h => ({
      from:       h.from,
      to:         h.to,
      piece:      h.piece,
      captured:   h.captured   || null,
      san:        h.san        || '',
      castling:   h.castling   || null,
      enPassant:  h.enPassant  || null,
      promoted:   h.promoted   || null,
    }));

    return {
      board:     boardObj,
      turn:      this.turn,
      castling:  this.castling,
      enPassant: this.enPassant || null,
      halfMoves: this.halfMoves,
      fullMoves: this.fullMoves,
      history:   cleanHistory,
      status:    this.status,
      result:    this.result || null,
    };
  }

  loadState(state) {
    // Reconstruir board 8x8 desde objeto Firebase {0:{0:'bR',...},...}
    // Las casillas vacías se guardaron como '__', las convertimos de vuelta a null
    const decodeSquare = v => (v === '__' || !v) ? null : v;

    const toRow = (v) => {
      const row = Array(8).fill(null);
      if (!v) return row;
      const entries = Array.isArray(v) ? v.entries() : Object.entries(v);
      for (const [k, val] of entries) row[parseInt(k)] = decodeSquare(val);
      return row;
    };

    const toBoard = (v) => {
      const board = Array(8).fill(null).map(() => Array(8).fill(null));
      if (!v) return board;
      const entries = Array.isArray(v) ? v.entries() : Object.entries(v);
      for (const [k, val] of entries) board[parseInt(k)] = toRow(val);
      return board;
    };

    const toHistory = (v) => {
      if (!v) return [];
      const entries = Array.isArray(v) ? v : Object.values(v);
      return entries.filter(Boolean).map(h => ({
        from:      h.from,
        to:        h.to,
        piece:     h.piece,
        captured:  h.captured  || null,
        san:       h.san       || '',
        castling:  h.castling  || null,
        enPassant: h.enPassant || null,
        promoted:  h.promoted  || null,
      }));
    };

    this.board     = toBoard(state.board);
    this.turn      = state.turn;
    this.castling  = { ...state.castling };
    this.enPassant = state.enPassant ? { ...state.enPassant } : null;
    this.halfMoves = state.halfMoves ?? 0;
    this.fullMoves = state.fullMoves ?? 1;
    this.history   = toHistory(state.history);
    this.status    = state.status ?? 'playing';
    this.result    = state.result ?? null;
  }
}