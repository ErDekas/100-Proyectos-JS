// script.js
const boardElement = document.getElementById('board');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

let score = 0;
let lives = 3;
let difficulty = 1;

const levels = {
    1: { cellsToShow: 43, lineScore: 20, squareScore: 400 },
    2: { cellsToShow: 40, lineScore: 40, squareScore: 480 },
    3: { cellsToShow: 38, lineScore: 80, squareScore: 560 },
    4: { cellsToShow: 35, lineScore: 160, squareScore: 620 },
    5: { cellsToShow: 32, lineScore: 320, squareScore: 750 },
    6: { cellsToShow: 28, lineScore: 550, squareScore: 1000 },
    7: { cellsToShow: 23, lineScore: 1000, squareScore: 1500 },
};

// Iniciar el juego
function startGame() {
    boardElement.innerHTML = '';
    score = 0;
    lives = 3;
    scoreElement.textContent = score;
    livesElement.textContent = lives;

    difficulty = parseInt(document.getElementById('difficulty').value);
    const { cellsToShow } = levels[difficulty];

    generateBoard(cellsToShow);
}

// Generar el tablero aleatorio con celdas visibles
function generateBoard(cellsToShow) {
    const sudoku = generateRandomSudoku();
    const visibleCells = getRandomCells(cellsToShow);

    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;

        if (visibleCells.has(i)) {
            input.value = sudoku[i];
            input.disabled = true;
        } else {
            input.value = '';
            input.addEventListener('input', (event) => handleInput(event, i, sudoku));
        }

        cell.appendChild(input);
        boardElement.appendChild(cell);
    }
}

// Generar tablero de Sudoku aleatorio y solucionable
function generateRandomSudoku() {
    const board = Array(81).fill(0);

    // Función auxiliar para verificar si un número es válido en una posición
    function isValid(board, row, col, num) {
        // Verifica fila
        for (let i = 0; i < 9; i++) {
            if (board[row * 9 + i] === num) return false;
        }
        // Verifica columna
        for (let i = 0; i < 9; i++) {
            if (board[i * 9 + col] === num) return false;
        }
        // Verifica el cuadrado 3x3
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[(startRow + r) * 9 + (startCol + c)] === num) return false;
            }
        }
        return true;
    }

    // Backtracking para llenar el tablero
    function fillBoard(board) {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                const row = Math.floor(i / 9);
                const col = i % 9;

                // Intentar colocar números aleatorios del 1 al 9
                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (let num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[i] = num;
                        if (fillBoard(board)) return true; // Si el tablero es válido, continuar
                        board[i] = 0; // Deshacer si no es solución
                    }
                }
                return false; // Retorna false si no se puede colocar ningún número válido
            }
        }
        return true; // Retorna true si el tablero está completamente lleno
    }

    fillBoard(board);
    return board;
}

// Seleccionar celdas visibles al azar según dificultad
function getRandomCells(cellsToShow) {
    const cellIndices = new Set();
    while (cellIndices.size < cellsToShow) {
        const randIndex = Math.floor(Math.random() * 81);
        cellIndices.add(randIndex);
    }
    return cellIndices;
}

// Manejar entrada del usuario
function handleInput(event, index, solution) {
    const input = event.target;
    const userValue = input.value;
    const correctValue = solution[index];

    if (userValue == correctValue) {
        input.classList.add('correct');
        input.disabled = true;
        if (isLineComplete(index, solution) || isSquareComplete(index, solution)) {
            score += levels[difficulty].lineScore;
            scoreElement.textContent = score;
        }
    } else {
        input.classList.add('incorrect');
        input.disabled = true;
        lives--;
        livesElement.textContent = lives;
        if (lives === 0) {
            alert('Juego terminado');
            startGame();
        }
    }
}

// Verificar si la línea o el cuadrado están completos
function isLineComplete(index, solution) {
    const rowStart = Math.floor(index / 9) * 9;
    const rowValues = new Set();
    for (let i = 0; i < 9; i++) {
        rowValues.add(solution[rowStart + i]);
    }
    return rowValues.size === 9;
}

function isSquareComplete(index, solution) {
    const squareRow = Math.floor(Math.floor(index / 9) / 3) * 3;
    const squareCol = Math.floor((index % 9) / 3) * 3;
    const squareValues = new Set();
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            squareValues.add(solution[(squareRow + r) * 9 + (squareCol + c)]);
        }
    }
    return squareValues.size === 9;
}

// Iniciar juego
startGame();
