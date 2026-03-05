// ============================================================
//  game-ui.js
//  Renderizado del tablero y gestión de la interfaz de juego
// ============================================================

import { ChessEngine, PIECES } from './chess-engine.js';

const FILES = ['a','b','c','d','e','f','g','h'];

export class GameUI {
  constructor(onMove, onResign, onDraw, onChat) {
    this.engine       = new ChessEngine();
    this.onMove       = onMove;   // callback(from, to, promoteTo)
    this.onResign     = onResign;
    this.onDraw       = onDraw;
    this.onChat       = onChat;
    this.myColor      = null;     // 'w' | 'b'
    this.selected     = null;     // {row, col}
    this.legalMoves   = [];
    this.lastMove     = null;
    this.pendingPromo = null;

    this._initDOM();
    this._initTimers();
  }

  // ─── DOM refs ──────────────────────────────────────────────
  _initDOM() {
    this.board       = document.getElementById('chessboard');
    this.statusText  = document.getElementById('status-text');
    this.gameCodeEl  = document.getElementById('game-code-display');
    this.movesList   = document.getElementById('moves-list');
    this.chatMsgs    = document.getElementById('chat-messages');
    this.chatInput   = document.getElementById('chat-input');
    this.resultModal = document.getElementById('result-modal');
    this.promoModal  = document.getElementById('promotion-modal');
    this.promoChoices= document.getElementById('promotion-choices');

    // Player cards
    this.playerTopName   = document.getElementById('player-top-name');
    this.playerBottomName= document.getElementById('player-bottom-name');
    this.playerTopColor  = document.getElementById('player-top-color');
    this.playerBottomColor=document.getElementById('player-bottom-color');
    this.timerTop        = document.getElementById('timer-top');
    this.timerBottom     = document.getElementById('timer-bottom');
    this.capturedTop     = document.getElementById('captured-top');
    this.capturedBottom  = document.getElementById('captured-bottom');

    // Buttons
    document.getElementById('btn-resign').onclick = () => this.onResign?.();
    document.getElementById('btn-draw').onclick   = () => this.onDraw?.();
    document.getElementById('btn-send-chat').onclick = () => this._sendChat();
    // btn-back-lobby lo gestiona app.js con modal propio
    this.chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._sendChat();
    });

    document.getElementById('btn-new-game').onclick = () => window.location.reload();
    document.getElementById('btn-lobby-modal').onclick = () => window.location.reload();

    this._buildCoords();
  }

  _buildCoords() {
    const ranks = document.getElementById('coords-ranks');
    const files = document.getElementById('coords-files');
    ranks.innerHTML = '';
    files.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const r = document.createElement('span');
      r.className = 'coord-label';
      r.textContent = this.myColor === 'b' ? (i+1) : (8-i);
      ranks.appendChild(r);

      const f = document.createElement('span');
      f.className = 'coord-label';
      f.textContent = this.myColor === 'b' ? FILES[7-i] : FILES[i];
      files.appendChild(f);
    }
  }

  // ─── Timers ────────────────────────────────────────────────
  _initTimers() {
    this.timeW  = 600; // seconds
    this.timeB  = 600;
    this.timerInterval = null;
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.engine.isGameOver()) { clearInterval(this.timerInterval); return; }
      if (this.engine.turn === 'w') {
        this.timeW = Math.max(0, this.timeW - 1);
        if (this.timeW === 0) { this._handleTimeout('w'); return; }
      } else {
        this.timeB = Math.max(0, this.timeB - 1);
        if (this.timeB === 0) { this._handleTimeout('b'); return; }
      }
      this._renderTimers();
    }, 1000);
  }

  _handleTimeout(color) {
    clearInterval(this.timerInterval);
    this.showResult(color === 'w' ? 'b' : 'w', 'timeout');
  }

  _renderTimers() {
    const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    const topIsW  = this.myColor === 'b';
    const wTime   = fmt(this.timeW);
    const bTime   = fmt(this.timeB);

    if (topIsW) {
      this.timerTop.textContent    = wTime;
      this.timerBottom.textContent = bTime;
      this.timerTop.classList.toggle('low', this.timeW < 30);
      this.timerBottom.classList.toggle('low', this.timeB < 30);
    } else {
      this.timerTop.textContent    = bTime;
      this.timerBottom.textContent = wTime;
      this.timerTop.classList.toggle('low', this.timeB < 30);
      this.timerBottom.classList.toggle('low', this.timeW < 30);
    }

    // Active player card
    const bottomColor = this.myColor ?? 'w';
    const topColor    = bottomColor === 'w' ? 'b' : 'w';
    document.getElementById('player-top-card').classList.toggle('active', this.engine.turn === topColor);
    document.getElementById('player-bottom-card').classList.toggle('active', this.engine.turn === bottomColor);
  }

  // ─── Setup players ─────────────────────────────────────────
  setupPlayers(myName, myColor, opponentName) {
    this.myColor = myColor;
    const opColor = myColor === 'w' ? 'b' : 'w';
    const isFlipped = myColor === 'b';

    this.playerBottomName.textContent  = myName;
    this.playerBottomColor.textContent = myColor === 'w' ? 'Blancas' : 'Negras';
    document.getElementById('avatar-bottom').textContent = myColor === 'w' ? '♟' : '♙';

    this.playerTopName.textContent  = opponentName || 'Esperando...';
    this.playerTopColor.textContent = opColor === 'w' ? 'Blancas' : 'Negras';
    document.getElementById('avatar-top').textContent = opColor === 'w' ? '♟' : '♙';

    this._buildCoords();
    this.renderBoard();
    this._renderTimers();
  }

  setGameCode(code) {
    this.gameCodeEl.textContent = code;
  }

  setStatus(text) {
    this.statusText.textContent = text;
  }

  // ─── Board rendering ───────────────────────────────────────
  renderBoard(highlightCheck = true) {
    const b      = this.engine.board;
    const flip   = this.myColor === 'b';
    this.board.innerHTML = '';

    const inCheckColor = this.engine.status === 'check' ? this.engine.turn : null;
    const kingPos      = inCheckColor ? this.engine.findKing(inCheckColor) : null;

    for (let ri = 0; ri < 8; ri++) {
      for (let ci = 0; ci < 8; ci++) {
        const row = flip ? 7 - ri : ri;
        const col = flip ? 7 - ci : ci;
        const piece = b[row][col];
        const isLight = (row + col) % 2 === 0;

        const sq = document.createElement('div');
        sq.className = 'square ' + (isLight ? 'light' : 'dark');
        sq.dataset.row = row;
        sq.dataset.col = col;

        // Last move highlight
        if (this.lastMove &&
            ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
             (this.lastMove.to.row   === row && this.lastMove.to.col   === col)))
          sq.classList.add('last-move');

        // Selected
        if (this.selected && this.selected.row === row && this.selected.col === col)
          sq.classList.add('selected');

        // Legal move dots
        const legal = this.legalMoves.find(m => m.toRow === row && m.toCol === col);
        if (legal) sq.classList.add(piece ? 'legal-capture' : 'legal-move');

        // King in check
        if (kingPos && kingPos.row === row && kingPos.col === col)
          sq.classList.add('in-check');

        if (piece) {
          const el = document.createElement('span');
          el.className = 'piece';
          el.textContent = PIECES[piece];
          sq.appendChild(el);
        }

        sq.addEventListener('click', () => this._handleSquareClick(row, col));
        this.board.appendChild(sq);
      }
    }

    this._renderCaptured();
    this._renderTimers();
  }

  _renderCaptured() {
    const history   = this.engine.history;
    const capturedW = [];
    const capturedB = [];

    for (const h of history) {
      if (h.captured) {
        const col = h.captured[0];
        if (col === 'w') capturedW.push(h.captured);
        else             capturedB.push(h.captured);
      }
      if (h.enPassant) {
        const col = h.piece[0] === 'w' ? 'b' : 'w';
        if (col === 'w') capturedW.push(col+'P');
        else             capturedB.push(col+'P');
      }
    }

    const render = (el, pieces) => {
      el.innerHTML = pieces.map(p => `<span>${PIECES[p]}</span>`).join('');
    };

    if (this.myColor === 'b') {
      render(this.capturedTop,    capturedB);
      render(this.capturedBottom, capturedW);
    } else {
      render(this.capturedTop,    capturedW);
      render(this.capturedBottom, capturedB);
    }
  }

  // ─── Click handling ────────────────────────────────────────
  _handleSquareClick(row, col) {
    // Not my turn
    if (this.engine.turn !== this.myColor) return;
    if (this.engine.isGameOver()) return;

    const piece = this.engine.board[row][col];

    if (this.selected) {
      const move = this.legalMoves.find(m => m.toRow === row && m.toCol === col);
      if (move) {
        // Check if promotion is needed
        const type = this.engine.type(this.engine.board[this.selected.row][this.selected.col]);
        const needsPromo = type === 'P' && (row === 0 || row === 7);

        if (needsPromo) {
          this._showPromotion(this.selected, { row, col });
        } else {
          this._doMove(this.selected, { row, col }, 'Q');
        }
        return;
      }

      // Click same square → deselect
      if (this.selected.row === row && this.selected.col === col) {
        this.selected = null;
        this.legalMoves = [];
        this.renderBoard();
        return;
      }
    }

    // Select piece
    if (piece && this.engine.color(piece) === this.myColor) {
      this.selected   = { row, col };
      this.legalMoves = this.engine.legalMoves(row, col);
      this.renderBoard();
    }
  }

  _doMove(from, to, promoteTo) {
    this.selected   = null;
    this.legalMoves = [];
    this.onMove?.(from, to, promoteTo);
  }

  _showPromotion(from, to) {
    this.pendingPromo = { from, to };
    const color = this.myColor;
    const pieces = ['Q','R','B','N'].map(t => ({ t, sym: PIECES[color+t] }));
    this.promoChoices.innerHTML = pieces.map(p =>
      `<div class="promotion-piece" data-type="${p.t}">${p.sym}</div>`
    ).join('');
    this.promoChoices.querySelectorAll('.promotion-piece').forEach(el => {
      el.onclick = () => {
        this.promoModal.classList.add('hidden');
        this._doMove(this.pendingPromo.from, this.pendingPromo.to, el.dataset.type);
        this.pendingPromo = null;
      };
    });
    this.promoModal.classList.remove('hidden');
  }

  // ─── Apply remote or local move to engine ──────────────────
  applyMove(from, to, promoteTo) {
    const result = this.engine.move(from, to, promoteTo);
    if (!result.ok) return false;

    this.lastMove = { from, to };
    this.selected   = null;
    this.legalMoves = [];
    this.renderBoard();
    this._appendMoveToList(result.san);

    if (this.engine.isGameOver()) {
      this.showResult(this.engine.result, this.engine.status);
    } else {
      const color = this.engine.turn;
      this.setStatus(`Turno de las ${color === 'w' ? 'blancas' : 'negras'}`);
    }
    return true;
  }

  loadState(state) {
    this.engine.loadState(state);

    // history puede llegar como objeto {0:{...},1:{...}} desde Firebase
    const history = Array.isArray(this.engine.history)
      ? this.engine.history
      : Object.values(this.engine.history ?? {});
    this.engine.history = history;

    const last = history.length ? history[history.length - 1] : null;
    this.lastMove = last ? { from: last.from, to: last.to } : null;

    this.selected   = null;
    this.legalMoves = [];

    // Guardia: no renderizar si el board no es válido aún
    if (!this.engine.board || !Array.isArray(this.engine.board) || !this.engine.board[0]) return;

    this.renderBoard();
    this._rebuildMoveList();

    if (this.engine.isGameOver()) {
      this.showResult(this.engine.result, this.engine.status);
    }
  }

  _appendMoveToList(san) {
    const idx     = this.engine.history.length;
    const moveNum = Math.ceil(idx / 2);
    const isWhite = (idx % 2 === 1);

    if (isWhite) {
      const num = document.createElement('div');
      num.className = 'move-number';
      num.textContent = moveNum + '.';
      this.movesList.appendChild(num);
    }

    const prev = this.movesList.querySelector('.latest');
    if (prev) prev.classList.remove('latest');

    const el = document.createElement('div');
    el.className = 'move-entry latest';
    el.textContent = san;
    this.movesList.appendChild(el);
    this.movesList.scrollTop = this.movesList.scrollHeight;
  }

  _rebuildMoveList() {
    this.movesList.innerHTML = '';
    for (const h of this.engine.history) {
      this._appendMoveToList(h.san);
    }
  }

  // ─── Chat ──────────────────────────────────────────────────
  _sendChat() {
    const msg = this.chatInput.value.trim();
    if (!msg) return;
    this.onChat?.(msg);
    this.chatInput.value = '';
  }

  addChatMessage(author, text, isSystem = false) {
    const el = document.createElement('div');
    el.className = 'chat-msg' + (isSystem ? ' system' : '');
    el.innerHTML = isSystem
      ? `<span class="chat-text">${escapeHtml(text)}</span>`
      : `<span class="chat-author">${escapeHtml(author)}:</span> <span class="chat-text">${escapeHtml(text)}</span>`;
    this.chatMsgs.appendChild(el);
    this.chatMsgs.scrollTop = this.chatMsgs.scrollHeight;
  }

  // ─── Result modal ──────────────────────────────────────────
  showResult(result, reason) {
    clearInterval(this.timerInterval);
    const icons    = { w:'♔', b:'♚', draw:'½' };
    const titles   = { checkmate:'¡Jaque Mate!', stalemate:'¡Tablas!', timeout:'Tiempo agotado', draw:'Tablas', resign:'Rendición', draw_offer:'Tablas acordadas' };
    const descs    = { w:'Las blancas ganan', b:'Las negras ganan', draw:'Es un empate' };

    document.getElementById('modal-icon').textContent  = icons[result] ?? '♟';
    document.getElementById('modal-title').textContent = titles[reason] ?? '¡Fin de la partida!';
    document.getElementById('modal-desc').textContent  = descs[result] ?? '';
    this.resultModal.classList.remove('hidden');
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}