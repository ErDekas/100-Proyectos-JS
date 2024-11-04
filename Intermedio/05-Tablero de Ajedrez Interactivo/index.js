// Configuración inicial de las piezas en el tablero
const pieces = [
  '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
  '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
  '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖',
];

// Variables de estado
let selectedPiece = null;
let selectedPosition = null;
let isWhiteTurn = true;  // Empiezan las blancas

// Crear contenedor para el tablero y el indicador de turno
const chessContainer = document.createElement('div');
chessContainer.classList.add('chess-container');

// Crear y agregar el indicador de turno
const turnDisplay = document.createElement('div');
turnDisplay.classList.add('turn-display');  // Nueva clase para estilo
turnDisplay.textContent = "Turno: Blancas";
chessContainer.appendChild(turnDisplay);

// Agregar el tablero dentro del contenedor
const chessboard = document.querySelector('.chessboard');
chessContainer.appendChild(chessboard);

// Agregar el contenedor completo al cuerpo del documento
document.body.appendChild(chessContainer);

//#region Funciones de Validación de Movimientos para Cada Pieza

function isWhitePiece(piece) {
  return ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
}

function isBlackPiece(piece) {
  return ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece);
}

function isValidMoveForPawn(row, col, targetRow, targetCol, piece) {
  const direction = (piece === '♟') ? 1 : -1;
  const captureSquares = [{ row: row + direction, col: col - 1 }, { row: row + direction, col: col + 1 }];
  if (targetCol === col) {
      if (targetRow === row + direction && pieces[targetRow * 8 + targetCol] === '') {
          return true;
      } else if (targetRow === row + (2 * direction) && row === (piece === '♟' ? 1 : 6) && pieces[targetRow * 8 + targetCol] === '') {
          return true;
      }
  } else if (captureSquares.some(square => square.row === targetRow && square.col === targetCol && pieces[targetRow * 8 + targetCol] !== '')) {
      return true;
  }
  return false;
}

function isValidMoveForRook(row, col, targetRow, targetCol) {
  if (row !== targetRow && col !== targetCol) return false;
  const stepRow = row === targetRow ? 0 : (targetRow > row ? 1 : -1);
  const stepCol = col === targetCol ? 0 : (targetCol > col ? 1 : -1);
  for (let i = row + stepRow, j = col + stepCol; i !== targetRow || j !== targetCol; i += stepRow, j += stepCol) {
      if (pieces[i * 8 + j] !== '') return false;
  }
  return true;
}

function isValidMoveForKnight(row, col, targetRow, targetCol) {
  const dRow = Math.abs(row - targetRow);
  const dCol = Math.abs(col - targetCol);
  return (dRow === 2 && dCol === 1) || (dRow === 1 && dCol === 2);
}

function isValidMoveForBishop(row, col, targetRow, targetCol) {
  if (Math.abs(row - targetRow) !== Math.abs(col - targetCol)) return false;
  const stepRow = targetRow > row ? 1 : -1;
  const stepCol = targetCol > col ? 1 : -1;
  for (let i = row + stepRow, j = col + stepCol; i !== targetRow; i += stepRow, j += stepCol) {
      if (pieces[i * 8 + j] !== '') return false;
  }
  return true;
}

function isValidMoveForQueen(row, col, targetRow, targetCol) {
  return isValidMoveForRook(row, col, targetRow, targetCol) || isValidMoveForBishop(row, col, targetRow, targetCol);
}

function isValidMoveForKing(row, col, targetRow, targetCol) {
  const dRow = Math.abs(row - targetRow);
  const dCol = Math.abs(col - targetCol);
  return dRow <= 1 && dCol <= 1;
}

//#endregion

// Evento de carga del DOM
document.addEventListener('DOMContentLoaded', () => {
  const chessboard = document.querySelector('.chessboard');

  for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          square.classList.add('square', (row + col) % 2 === 0 ? 'even' : 'odd');
          square.dataset.row = row;
          square.dataset.col = col;

          const piece = document.createElement('div');
          piece.classList.add('piece');
          piece.textContent = pieces[row * 8 + col];

          square.appendChild(piece);
          chessboard.appendChild(square);
      }
  }

  const squares = document.querySelectorAll('.square');
  
  squares.forEach((square) => {
      square.addEventListener('click', () => {
          const row = parseInt(square.dataset.row);
          const col = parseInt(square.dataset.col);
          const index = row * 8 + col;
          const piece = pieces[index];

          if (selectedPiece) {
              handleMove(selectedPosition.row, selectedPosition.col, row, col, selectedPiece);
              selectedPiece = null;
          } else if (piece !== '') {
              if ((isWhiteTurn && isWhitePiece(piece)) || (!isWhiteTurn && isBlackPiece(piece))) {
                  selectedPiece = piece;
                  selectedPosition = { row, col };
                  clearSquareColors();
                  square.classList.add('selected');
                  console.log(`Pieza seleccionada: ${selectedPiece} en [${row}, ${col}]`);
              }
          }
      });
  });
});

function handleMove(startRow, startCol, targetRow, targetCol, piece) {
  const targetIndex = targetRow * 8 + targetCol;
  const targetPiece = pieces[targetIndex];
  let isValid = false;

  // Validación de movimiento
  switch (piece) {
      case '♙':
      case '♟':
          isValid = isValidMoveForPawn(startRow, startCol, targetRow, targetCol, piece);
          break;
      case '♖':
      case '♜':
          isValid = isValidMoveForRook(startRow, startCol, targetRow, targetCol);
          break;
      case '♘':
      case '♞':
          isValid = isValidMoveForKnight(startRow, startCol, targetRow, targetCol);
          break;
      case '♗':
      case '♝':
          isValid = isValidMoveForBishop(startRow, startCol, targetRow, targetCol);
          break;
      case '♕':
      case '♛':
          isValid = isValidMoveForQueen(startRow, startCol, targetRow, targetCol);
          break;
      case '♔':
      case '♚':
          isValid = isValidMoveForKing(startRow, startCol, targetRow, targetCol);
          break;
  }

  // Comprobar si es un ataque contra una pieza del mismo color
  if ((isWhitePiece(piece) && isWhitePiece(targetPiece)) || (isBlackPiece(piece) && isBlackPiece(targetPiece))) {
      isValid = false;
  }

  // Acción de acuerdo a la validez del movimiento
  if (isValid) {
      pieces[targetIndex] = piece;
      pieces[startRow * 8 + startCol] = '';
      updateBoard();
      clearSquareColors();
      document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`).classList.add('valid');

      // Cambio de turno
      isWhiteTurn = !isWhiteTurn;
      turnDisplay.textContent = `Turno: ${isWhiteTurn ? "Blancas" : "Negras"}`;
  } else {
      clearSquareColors();
      document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`).classList.add('invalid');
      console.log('Movimiento inválido.');
  }
}

// Función para actualizar visualmente el tablero después de un movimiento
function updateBoard() {
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const piece = square.querySelector('.piece');
      piece.textContent = pieces[row * 8 + col];
  });
}

// Limpia colores de selección
function clearSquareColors() {
  document.querySelectorAll('.square').forEach(square => {
      square.classList.remove('selected', 'valid', 'invalid');
  });
}

function resetSquareColors() {
  document.querySelectorAll('.square').forEach(square => {
      square.classList.remove('selected', 'valid', 'invalid');
  });
}

function selectSquare(row, col) {
  resetSquareColors();
  const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
  square.classList.add('selected');
}

function colorSquare(row, col, isValid) {
  const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
  if (isValid) {
      square.classList.add('valid');
  } else {
      square.classList.add('invalid');
  }
}
