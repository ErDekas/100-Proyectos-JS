class ChessGame {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedPiece = null;
    this.capturedPieces = { white: [], black: [] };
    this.inCheck = { white: false, black: false };
    this.renderBoard();
    this.setupEventListeners();
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
        square.className = `square ${
          (row + col) % 2 === 0 ? "white" : "black"
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

  resetGame() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedPiece = null;
    this.capturedPieces = { white: [], black: [] };
    document.getElementById("game-status").textContent = "Turno de las Blancas";
    this.renderBoard();
  }

  handleSquareClick(e) {
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

    // Movimiento básico
    if (this.isValidMove(row + direction, col, color)) {
      moves.push({ row: row + direction, col, isCapture: false });
    }

    // Primer movimiento doble
    if (row === startRow && this.isValidMove(row + 2 * direction, col, color)) {
      moves.push({ row: row + 2 * direction, col, isCapture: false });
    }

    // Captura diagonal
    const captureColumns = [col - 1, col + 1];
    captureColumns.forEach((captureCol) => {
      if (this.isValidCapture(row + direction, captureCol, color)) {
        moves.push({ row: row + direction, col: captureCol, isCapture: true });
      }
    });

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

  wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
    // Create a deep copy of the board
    const tempBoard = this.board.map(row => [...row]);
    const tempPiece = tempBoard[fromRow][fromCol];
    const color = this.getPieceColor(tempPiece);

    // Simulate the move
    tempBoard[toRow][toCol] = tempPiece;
    tempBoard[fromRow][fromCol] = null;

    // Check if the king would be in check after this move
    return this.isKingInCheck(color, tempBoard);
  }

  // Method to check if a king is in check
  isKingInCheck(color, board = this.board) {
    // Find the king's position
    let kingRow = -1, kingCol = -1;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && this.getPieceColor(piece) === color && 
            (piece.toLowerCase() === '♚')) {
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
    const possibleMoves = this.getPossibleMoves(
      this.selectedPiece.row,
      this.selectedPiece.col
    );

    const moveDetails = possibleMoves.find(
      (move) => move.row === row && move.col === col
    );

    if (moveDetails) {
      // Capture piece if necessary
      if (this.board[row][col] !== null) {
        const capturedPiece = this.board[row][col];
        const capturedColor = this.getPieceColor(capturedPiece);
        this.capturedPieces[capturedColor === "white" ? "black" : "white"].push(
          capturedPiece
        );
      }

      // Move piece
      this.board[row][col] =
        this.board[this.selectedPiece.row][this.selectedPiece.col];
      this.board[this.selectedPiece.row][this.selectedPiece.col] = null;

      // Check for check state
      const currentColor = this.currentPlayer;
      const opponentColor = currentColor === "white" ? "black" : "white";
      this.isKingInCheck(opponentColor);

      // Update game status with check information
      let statusText = `Turno de las ${
        opponentColor === "white" ? "Blancas" : "Negras"
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

  getPieceColor(piece) {
    if (!piece) return null;
    return "♙♖♘♗♕♔".includes(piece) ? "white" : "black";
  }
}

// Iniciar el juego
new ChessGame();
