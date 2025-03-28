import io from 'socket.io-client';

class ChessGame {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedPiece = null;
    this.capturedPieces = { white: [], black: [] };
    this.inCheck = { white: false, black: false };
    this.gameOver = false;
    this.moveHistory = [];
    this.renderBoard();
    this.setupEventListeners();
    this.setupMoveHistoryDisplay();
  }

  initializeBoard() {
    const board = [
      ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
      ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
    ];
    return board;
  }

  renderBoard() {
    const boardElement = document.getElementById("chessboard");
    const whiteCaptures = document.getElementById("white-captured");
    const blackCaptures = document.getElementById("black-captured");

    boardElement.innerHTML = "";
    whiteCaptures.innerHTML =
      "Capturadas: " + this.capturedPieces.white.join(" ");
    blackCaptures.innerHTML =
      "Capturadas: " + this.capturedPieces.black.join(" ");

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "white" : "black"
          }`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.board[row][col];
        if (piece) {
          square.textContent = piece;
        }

        boardElement.appendChild(square);
      }
    }
  }

  setupEventListeners() {
    const boardElement = document.getElementById("chessboard");
    boardElement.addEventListener("click", (e) => this.handleSquareClick(e));

    const resetBtn = document.getElementById("reset-btn");
    resetBtn.addEventListener("click", () => this.resetGame());
  }

  // Método para configurar la visualización del historial de movimientos
  setupMoveHistoryDisplay() {
    const moveHistoryElement = document.getElementById("move-history");
    if (!moveHistoryElement) {
      const historyContainer = document.createElement("div");
      historyContainer.id = "move-history-container";
      historyContainer.innerHTML = `
      <h3>Historial de Movimientos</h3>
      <ol id="move-history" class="move-history-list"></ol>
    `;
      document.body.appendChild(historyContainer);
    }
  }

  // Método para registrar un movimiento en el historial
  recordMove(piece, fromSquare, toSquare, isCapture = false) {
    const moveNotation = this.generateMoveNotation(piece, fromSquare, toSquare, isCapture);
    this.moveHistory.push({
      piece,
      from: fromSquare,
      to: toSquare,
      player: this.currentPlayer,
      notation: moveNotation
    });

    // Actualizar la visualización del historial
    this.updateMoveHistoryDisplay();
  }
  // Método para generar notación algebraica del movimiento
  generateMoveNotation(piece, fromSquare, toSquare, isCapture) {
    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];

    const fromCol = columns[fromSquare.col];
    const fromRow = rows[fromSquare.row];
    const toCol = columns[toSquare.col];
    const toRow = rows[toSquare.row];

    // Determinar el tipo de pieza
    const pieceNotation = {
      '♔': 'K', '♚': 'K',   // Rey
      '♕': 'Q', '♛': 'Q',   // Reina
      '♖': 'R', '♜': 'R',   // Torre
      '♗': 'B', '♝': 'B',   // Alfil
      '♘': 'N', '♞': 'N',   // Caballo
      '♙': '', '♟': ''      // Peón (sin notación)
    }[piece] || '';

    // Construir notación
    return `${pieceNotation}${isCapture ? 'x' : ''}${toCol}${toRow}`;
  }

  // Actualizar la visualización del historial de movimientos
  updateMoveHistoryDisplay() {
    const moveHistoryElement = document.getElementById("move-history");
    if (moveHistoryElement) {
      moveHistoryElement.innerHTML = this.moveHistory.map((move, index) => `
      <li class="${move.player}">
        ${index + 1}. ${move.notation}
      </li>
    `).join('');
    }
  }

  resetGame() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedPiece = null;
    this.capturedPieces = { white: [], black: [] };
    this.gameOver = false;
    this.moveHistory = []; // Limpiar historial de movimientos
    document.getElementById("game-status").textContent = "Turno de las Blancas";

    // Re-enable board interactions
    const boardElement = document.getElementById("chessboard");
    boardElement.style.pointerEvents = "auto";

    // Limpiar historial de movimientos en la interfaz
    const moveHistoryElement = document.getElementById("move-history");
    if (moveHistoryElement) {
      moveHistoryElement.innerHTML = '';
    }

    this.renderBoard();
  }

  handleSquareClick(e) {
    if (this.gameOver) return;

    const square = e.target.closest(".square");
    if (!square) return;

    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = this.board[row][col];
    const pieceColor = this.getPieceColor(piece);

    if (!this.selectedPiece) {
      if (pieceColor === this.currentPlayer) {
        this.selectPiece(row, col);
      }
    } else {
      if (pieceColor === this.currentPlayer) {
        this.selectPiece(row, col);
      } else {
        this.movePiece(row, col);
      }
    }
  }

  selectPiece(row, col) {
    const boardElement = document.getElementById("chessboard");
    boardElement.querySelectorAll(".square").forEach((sq) => {
      sq.classList.remove("selected", "possible-move", "capture-move");
    });

    const square = boardElement.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    square.classList.add("selected");
    this.selectedPiece = { row, col };

    // Mostrar movimientos posibles
    const possibleMoves = this.getPossibleMoves(row, col);
    possibleMoves.forEach((move) => {
      const moveSquare = boardElement.querySelector(
        `[data-row="${move.row}"][data-col="${move.col}"]`
      );
      moveSquare.classList.add(
        move.isCapture ? "capture-move" : "possible-move"
      );
    });
  }

  getPossibleMoves(row, col) {
    const piece = this.board[row][col];
    const color = this.getPieceColor(piece);
    const moves = [];

    switch (piece.toLowerCase()) {
      case "♙":
      case "♟":
        return this.getPawnMoves(row, col, color);
      case "♖":
      case "♜":
        return this.getRookMoves(row, col, color);
      case "♘":
      case "♞":
        return this.getKnightMoves(row, col, color);
      case "♗":
      case "♝":
        return this.getBishopMoves(row, col, color);
      case "♕":
      case "♛":
        return this.getQueenMoves(row, col, color);
      case "♔":
      case "♚":
        return this.getKingMoves(row, col, color);
      default:
        return moves;
    }
  }

  getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === "white" ? -1 : 1;
    const startRow = color === "white" ? 6 : 1;

    // Movimiento básico solo si la casilla está vacía
    if (this.board[row + direction] && this.board[row + direction][col] === null) {
      moves.push({ row: row + direction, col, isCapture: false });

      // Primer movimiento doble si la casilla intermedia y final están vacías
      if (row === startRow && this.board[row + 2 * direction][col] === null) {
        moves.push({ row: row + 2 * direction, col, isCapture: false });
      }
    }

    // Captura diagonal izquierda
    if (
      col > 0 &&
      this.board[row + direction] &&
      this.board[row + direction][col - 1] !== null &&
      this.getPieceColor(this.board[row + direction][col - 1]) !== color
    ) {
      moves.push({ row: row + direction, col: col - 1, isCapture: true });
    }

    // Captura diagonal derecha
    if (
      col < 7 &&
      this.board[row + direction] &&
      this.board[row + direction][col + 1] !== null &&
      this.getPieceColor(this.board[row + direction][col + 1]) !== color
    ) {
      moves.push({ row: row + direction, col: col + 1, isCapture: true });
    }

    return moves;
  }

  getKnightMoves(row, col, color) {
    const moves = [];
    const knightOffsets = [
      { dx: 2, dy: 1 },
      { dx: 2, dy: -1 },
      { dx: -2, dy: 1 },
      { dx: -2, dy: -1 },
      { dx: 1, dy: 2 },
      { dx: 1, dy: -2 },
      { dx: -1, dy: 2 },
      { dx: -1, dy: -2 },
    ];

    knightOffsets.forEach(({ dx, dy }) => {
      const newRow = row + dy;
      const newCol = col + dx;

      if (this.isValidMove(newRow, newCol, color)) {
        moves.push({
          row: newRow,
          col: newCol,
          isCapture: this.board[newRow][newCol] !== null,
        });
      }
    });

    return moves;
  }

  getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];

    directions.forEach(({ dx, dy }) => {
      for (let i = 1; i < 8; i++) {
        const newRow = row + i * dy;
        const newCol = col + i * dx;

        if (!this.isValidMove(newRow, newCol, color)) break;

        moves.push({
          row: newRow,
          col: newCol,
          isCapture: this.board[newRow][newCol] !== null,
        });

        if (this.board[newRow][newCol] !== null) break;
      }
    });

    return moves;
  }

  getRookMoves(row, col, color) {
    const moves = [];
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    directions.forEach(({ dx, dy }) => {
      for (let i = 1; i < 8; i++) {
        const newRow = row + i * dy;
        const newCol = col + i * dx;

        if (!this.isValidMove(newRow, newCol, color)) break;

        moves.push({
          row: newRow,
          col: newCol,
          isCapture: this.board[newRow][newCol] !== null,
        });

        if (this.board[newRow][newCol] !== null) break;
      }
    });

    return moves;
  }

  getQueenMoves(row, col, color) {
    return [
      ...this.getRookMoves(row, col, color),
      ...this.getBishopMoves(row, col, color),
    ];
  }

  getKingMoves(row, col, color) {
    const moves = [];
    const kingOffsets = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];

    kingOffsets.forEach(({ dx, dy }) => {
      const newRow = row + dy;
      const newCol = col + dx;

      if (this.isValidMove(newRow, newCol, color)) {
        moves.push({
          row: newRow,
          col: newCol,
          isCapture: this.board[newRow][newCol] !== null,
        });
      }
    });

    return moves;
  }

  isValidMove(row, col, color) {
    return (
      row >= 0 &&
      row < 8 &&
      col >= 0 &&
      col < 8 &&
      (this.board[row][col] === null ||
        this.getPieceColor(this.board[row][col]) !== color)
    );
  }

  isValidCapture(row, col, color) {
    return (
      row >= 0 &&
      row < 8 &&
      col >= 0 &&
      col < 8 &&
      this.board[row][col] !== null &&
      this.getPieceColor(this.board[row][col]) !== color
    );
  }

  // Method to check if a king is in check
  isKingInCheck(color, board = this.board) {
    // Find the king's position
    let kingRow = -1, kingCol = -1;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && this.getPieceColor(piece) === color &&
          (piece.toLowerCase() === '♚' || piece.toLowerCase() === '♔')) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    // Check if any opponent piece can capture the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && this.getPieceColor(piece) !== color) {
          const possibleMoves = this.getPossibleMoves(row, col);
          if (possibleMoves.some(move =>
            move.row === kingRow && move.col === kingCol)) {
            this.inCheck[color] = true;
            return true;
          }
        }
      }
    }

    this.inCheck[color] = false;
    return false;
  }

  movePiece(row, col) {
    if (this.gameOver) return;

    const possibleMoves = this.getPossibleMoves(
      this.selectedPiece.row,
      this.selectedPiece.col
    );

    const moveDetails = possibleMoves.find(
      (move) => move.row === row && move.col === col
    );

    if (moveDetails) {
      const piece = this.board[this.selectedPiece.row][this.selectedPiece.col];
      const fromSquare = { row: this.selectedPiece.row, col: this.selectedPiece.col };
      const toSquare = { row, col };

      // Check if captured piece is a king
      const capturedPiece = this.board[row][col];
      const capturedColor = capturedPiece ? this.getPieceColor(capturedPiece) : null;

      // Capture piece if necessary
      if (capturedPiece !== null) {
        // Check if captured piece is a king (game-ending condition)
        if (capturedPiece.toLowerCase() === '♔' || capturedPiece.toLowerCase() === '♚') {
          this.recordMove(piece, fromSquare, toSquare, true);
          this.endGame(this.currentPlayer);
          return;
        }

        this.capturedPieces[capturedColor === "white" ? "black" : "white"].push(
          capturedPiece
        );
      }

      // Record the move in history
      this.recordMove(piece, fromSquare, toSquare, capturedPiece !== null);

      // Move piece
      this.board[row][col] = piece;
      this.board[this.selectedPiece.row][this.selectedPiece.col] = null;

      // Check for check state
      const currentColor = this.currentPlayer;
      const opponentColor = currentColor === "white" ? "black" : "white";
      this.isKingInCheck(opponentColor);

      // Update game status with check information
      let statusText = `Turno de las ${opponentColor === "white" ? "Blancas" : "Negras"
        }`;

      if (this.inCheck[opponentColor]) {
        statusText += " - ¡JAQUE!";
      }

      document.getElementById("game-status").textContent = statusText;

      // Change turn
      this.currentPlayer = opponentColor;

      this.renderBoard();
      this.selectedPiece = null;
    }
  }

  endGame(winningColor) {
    this.gameOver = true;
    const gameStatus = document.getElementById("game-status");
    gameStatus.textContent = `¡Juego Terminado! Ganan las ${winningColor === "white" ? "Blancas" : "Negras"}`;

    // Optionally, disable further moves
    const boardElement = document.getElementById("chessboard");
    boardElement.style.pointerEvents = "none";
  }

  getPieceColor(piece) {
    if (!piece) return null;
    return "♙♖♘♗♕♔".includes(piece) ? "white" : "black";
  }
}

// Iniciar el juego
new ChessGame();
