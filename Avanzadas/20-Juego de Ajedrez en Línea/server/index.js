const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

class ChessGameServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });

        this.games = new Map();
        this.waitingPlayers = [];

        this.setupMiddleware();
        this.setupSocketEvents();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('Nuevo usuario conectado:', socket.id);

            socket.on('joinGame', (playerName) => {
                this.handlePlayerJoin(socket, playerName);
            });

            socket.on('makeMove', (moveData) => {
                this.handlePlayerMove(socket, moveData);
            });

            socket.on('resetGame', (gameId) => {
                this.resetGame(gameId);
            });

            socket.on('disconnect', () => {
                this.handlePlayerDisconnect(socket);
            });
        });
    }

    handlePlayerJoin(socket, playerName) {
        if (this.waitingPlayers.length > 0) {
            const waitingPlayer = this.waitingPlayers.pop();
            const gameId = this.generateGameId();

            const game = {
                id: gameId,
                players: {
                    white: waitingPlayer,
                    black: socket.id
                },
                board: this.initializeBoard(),
                currentPlayer: 'white',
                moveHistory: [],
                capturedPieces: { white: [], black: [] }
            };

            this.games.set(gameId, game);

            waitingPlayer.emit('gameStarted', {
                gameId,
                color: 'white',
                opponent: playerName
            });
            socket.emit('gameStarted', {
                gameId,
                color: 'black',
                opponent: waitingPlayer.playerName
            });
        } else {
            socket.playerName = playerName;
            this.waitingPlayers.push(socket);
            socket.emit('waitingForOpponent');
        }
    }

    handlePlayerMove(socket, moveData) {
        const { gameId, fromSquare, toSquare, piece } = moveData;
        const game = this.games.get(gameId);

        if (!game) return;

        const isValidMove = this.validateMove(game, fromSquare, toSquare, piece);

        if (isValidMove) {
            this.updateGameState(game, fromSquare, toSquare, piece);

            const opponentSocket = socket.id === game.players.white ? this.io.sockets.socket.get(game.players.black) : this.io.sockets.socket.get(game.players.white);

            socket.emit('moveMade', { fromSquare, toSquare, piece });
            opponentSocket.emit('moveMade', { fromSquare, toSquare, piece });
        } else {
            socket.emit('invalidMove');
        }
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

    validateMove(game, fromSquare, toSquare, piece) {
        const fromRow = fromSquare.row;
        const fromCol = fromSquare.col;
        const toRow = toSquare.row;
        const toCol = toSquare.col;

        const color = this.getPieceColor(piece);

        // Obtén los movimientos posibles de la pieza en la casilla de origen
        const possibleMoves = this.getPossibleMoves(fromRow, fromCol);

        // Verifica si el movimiento solicitado está en los posibles movimientos
        const isValidMove = possibleMoves.some(move =>
            move.row === toRow && move.col === toCol
        );

        if (!isValidMove) {
            console.log("Movimiento no válido.");
            return false; // Movimiento no permitido
        }

        // Verifica si el rey está en jaque después del movimiento
        const boardCopy = this.board.map(row => row.slice()); // Copiar el tablero
        boardCopy[toRow][toCol] = piece;  // Realizar el movimiento
        boardCopy[fromRow][fromCol] = null;  // Vaciar la casilla de origen

        const kingInCheck = this.isKingInCheck(color, boardCopy);
        if (kingInCheck) {
            console.log("Movimiento dejaría al rey en jaque.");
            return false; // Movimiento no permitido si deja al rey en jaque
        }

        return true; // Movimiento válido
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

    // Método para obtener el color de la pieza
    getPieceColor(piece) {
        return piece === piece.toUpperCase() ? 'white' : 'black';
    }

    // Método para verificar si un rey está en jaque
    isKingInCheck(color, board = this.board) {
        // Buscar la posición del rey
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

        // Verificar si alguna pieza contraria puede capturar al rey
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

    updateGameState(game, fromSquare, toSquare, piece) {
        game.board[toSquare.row][toSquare.col] = piece;
        game.board[toSquare.row][toSquare.col] = null;

        game.moveHistory.push({
            piece,
            from: fromSquare,
            to: toSquare
        });

        game.currentPlayer = game.currentPlayer === 'white' ? 'black' : 'white';
    }

    handlePlayerDisconnect(socket) {
        const waitingIndex = this.waitingPlayers.indexOf(socket);
        if(waitingIndex !== -1) {
            this.waitingPlayers.splice(waitingIndex, 1);
        }

        for(const [gameId, game] of this.games.entries()) {
            if(Object.values(game.players).includes(socket.id)) {
                const otherPlayerId = Object.values(game.players).find(playerId => playerId !== socket.id);

                if(otherPlayerId) {
                    const otherSocket = this.io.sockets.sockets.get(otherPlayerId);
                    if(otherSocket) {
                        otherSocket.emit('opponentDisconnected');
                    }
                }

                this.games.delete(gameId);
            }
        }
    }

    resetGame(gameId) {
        const game = this.games.get(gameId);
        if(game) {
            game.board = this.initializeBoard();
            game.currentPlayer = 'white';
            game.moveHistory = [];
            game.capturedPieces = { white: [], black: [] };

            const whiteSocket = this.io.sockets.sockets.get(game.players.white);
            const blackSocket = this.io.sockets.sockets.get(game.players.black);

            whiteSocket.emit('gameReset');
            blackSocket.emit('gameReset');
        }
    }

    initializeBoard() {
        return [
          ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
          ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
          ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
        ];
    }

    generateGameId() {
        return Math.random().toString(36).substr(2, 9);
    }

    start(port = 3000) {
        this.server.listen(port, () => {
            console.log(`Chess server running on port ${port}`);
        });
    }
}

const chessServer = new ChessGameServer();
chessServer.start();

module.exports = chessServer;