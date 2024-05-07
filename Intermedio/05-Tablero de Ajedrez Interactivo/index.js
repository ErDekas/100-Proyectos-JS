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
//#region Peon
function isValidMoveForPawn(row, col, targetRow, targetCol, piece) {
  // Determinar la dirección del movimiento dependiendo del color del peón
  const direction = (piece === '♟') ? 1 : -1;

  // Casillas adyacentes en diagonal que un peón puede capturar
  const captureSquares = [{ row: row + direction, col: col - 1 }, { row: row + direction, col: col + 1 }];

  // Verificar si el movimiento es hacia adelante
  if (targetCol === col) {
      // Mover una casilla hacia adelante
      if (targetRow === row + direction && pieces[targetRow * 8 + targetCol] === '') {
          console.log('Movimiento válido para el peón.');
      } else if (targetRow === row + (2 * direction) && row === (piece === '♟' ? 1 : 6) && pieces[targetRow * 8 + targetCol] === '') {
          console.log('Movimiento válido para el peón (primer movimiento).');
      } else {
          console.log('Movimiento inválido para el peón.');
      }
  } else {
      // Verificar si el movimiento es una captura diagonal
      const isCapture = captureSquares.some(square => square.row === targetRow && square.col === targetCol);
      if (isCapture && pieces[targetRow * 8 + targetCol] !== '') {
          console.log('Movimiento válido para capturar con el peón.');
      } else {
          console.log('Movimiento inválido para el peón.');
      }
  }
}
//#endregion
//#region Torre
function isValidMoveForRook(row, col, targetRow, targetCol, piece) {
  if (row === targetRow || col === targetCol) {
      const step = (row === targetRow) ? ((col < targetCol) ? 1 : -1) : ((row < targetRow) ? 8 : -8);
      let currentSquare = row * 8 + col + step;
      while (currentSquare !== targetRow * 8 + targetCol) {
          if (pieces[currentSquare] !== '') {
              console.log('Movimiento inválido para la torre.');
              return;
          }
          currentSquare += step;
      }
      console.log('Movimiento válido para la torre.');
  } else {
      console.log('Movimiento inválido para la torre.');
  }
}
// #endregion
function isValidMoveForKnight(row, col, targetRow, targetCol, piece) {
  // Array de posibles movimientos de caballo
  const knightMoves = [
      { row: row - 2, col: col - 1 }, { row: row - 2, col: col + 1 },
      { row: row - 1, col: col - 2 }, { row: row - 1, col: col + 2 },
      { row: row + 1, col: col - 2 }, { row: row + 1, col: col + 2 },
      { row: row + 2, col: col - 1 }, { row: row + 2, col: col + 1 }
  ];

  // Verificar si el movimiento es uno de los movimientos válidos del caballo
  const isValidKnightMove = knightMoves.some(move => move.row === targetRow && move.col === targetCol);

  if (isValidKnightMove) {
      console.log('Movimiento válido para el caballo.');
  } else {
      console.log('Movimiento inválido para el caballo.');
  }
}
//#region Alfil
function isValidMoveForBishop(row, col, targetRow, targetCol, piece) {
  // Verificar si el movimiento es en una diagonal
  if (Math.abs(targetRow - row) === Math.abs(targetCol - col)) {
      // Verificar si hay piezas bloqueando el camino
      const rowIncrement = (targetRow > row) ? 1 : -1;
      const colIncrement = (targetCol > col) ? 1 : -1;
      let currentRow = row + rowIncrement;
      let currentCol = col + colIncrement;
      while (currentRow !== targetRow && currentCol !== targetCol) {
          if (pieces[currentRow * 8 + currentCol] !== '') {
              console.log('Movimiento inválido para el alfil.');
              return;
          }
          currentRow += rowIncrement;
          currentCol += colIncrement;
      }
      console.log('Movimiento válido para el alfil.');
  } else {
      console.log('Movimiento inválido para el alfil.');
  }
}
// #endregion
//#region Reina
function isValidMoveForQueen(row, col, targetRow, targetCol, piece) {
  // Verificar si el movimiento es válido para una torre o un alfil
  if ((row === targetRow || col === targetCol) || (Math.abs(targetRow - row) === Math.abs(targetCol - col))) {
      // Llamar a las funciones de validación de la torre o el alfil según corresponda
      isValidMoveForRook(row, col, targetRow, targetCol, piece);
      isValidMoveForBishop(row, col, targetRow, targetCol, piece);
  } else {
      console.log('Movimiento inválido para la reina.');
  }
}
//#endregion

// Evento de carga de DOM
document.addEventListener('DOMContentLoaded', () => {

    // Crear el tablero
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
    // Obtener todas las casillas del tablero
    const squares = document.querySelectorAll('.square');
    
    // Event listener para cada casilla del tablero
    squares.forEach((square) => {
      square.addEventListener('click', () => {
          // Obtener la fila y columna de la casilla clickeada
          const clickedRow = parseInt(square.dataset.row);
          const clickedCol = parseInt(square.dataset.col);
          const clickedPiece = pieces[clickedRow * 8 + clickedCol];
  
          if (clickedPiece !== '') {
              // Verificar el tipo de pieza clickeada
              switch (clickedPiece) {
                case '♟': // Peón negro
                case '♙': // Peón blanco
                    // Calcular la fila y columna objetivo para el movimiento del peón
                    const targetRowForPawn = (clickedPiece === '♟') ? clickedRow + 1 : clickedRow - 1;
                    const targetColForPawn = clickedCol; // Mismo columna que la casilla actual
                    // Llamar a la función para verificar si el movimiento es válido para un peón
                    isValidMoveForPawn(clickedRow, clickedCol, targetRowForPawn, targetColForPawn, clickedPiece);
                    break;
                case '♖': // Torre negra
                case '♜': // Torre blanca
                    // Llamar a la función para verificar si el movimiento es válido para una torre
                    isValidMoveForRook(clickedRow, clickedCol, clickedRow, clickedCol, clickedPiece);
                    break;
                case '♘': // Caballo negro
                case '♞': // Caballo blanco
                    // Definimos las posiciones relativas a la casilla clickeada donde puede moverse el caballo
                    const knightMoves = [
                      { row: clickedRow - 2, col: clickedCol - 1 }, { row: clickedRow - 2, col: clickedCol + 1 },
                      { row: clickedRow - 1, col: clickedCol - 2 }, { row: clickedRow - 1, col: clickedCol + 2 },
                      { row: clickedRow + 1, col: clickedCol - 2 }, { row: clickedRow + 1, col: clickedCol + 2 },
                      { row: clickedRow + 2, col: clickedCol - 1 }, { row: clickedRow + 2, col: clickedCol + 1 }
                    ];
                    // Luego, seleccionamos una de estas posiciones según el movimiento deseado del caballo.
                    // Por ejemplo, si queremos mover el caballo dos casillas hacia arriba y una casilla hacia la izquierda, seleccionamos knightMoves[0].
                    // Aquí es donde definiríamos targetRow y targetCol en función del movimiento deseado del caballo.
                    const targetRowForKnight = knightMoves[0].row;
                    const targetColForKnight = knightMoves[0].col;
                    // Luego, podemos llamar a la función para verificar si el movimiento es válido para el caballo
                    isValidMoveForKnight(clickedRow, clickedCol, targetRowForKnight, targetColForKnight, clickedPiece);
                    break;                    
                case '♗': // Alfil negro
                case '♝': // Alfil blanco
                    // Determinamos la dirección de movimiento
                    const rowIncrement = (targetRow > clickedRow) ? 1 : -1;
                    const colIncrement = (targetCol > clickedCol) ? 1 : -1;

                    // Iteramos a lo largo de la diagonal hasta que alcancemos la casilla objetivo o nos encontremos con una pieza
                    let currentRow = clickedRow + rowIncrement;
                    let currentCol = clickedCol + colIncrement;
                    while (currentRow !== targetRow && currentCol !== targetCol) {
                      // Aquí verificamos si la casilla está vacía o si contiene una pieza enemiga
                      // Si encontramos una pieza enemiga, el movimiento es válido, de lo contrario, es inválido.
                      currentRow += rowIncrement;
                      currentCol += colIncrement;
                    }
                    // Definimos targetRow y targetCol basados en la última posición en la diagonal
                    const targetRowForBishop = currentRow - rowIncrement;
                    const targetColForBishop = currentCol - colIncrement;
                    // Luego, podemos llamar a la función para verificar si el movimiento es válido para el alfil
                    isValidMoveForBishop(clickedRow, clickedCol, targetRowForBishop, targetColForBishop, clickedPiece);
                    break;
                case '♕': // Reina negra
                case '♛': // Reina blanca
                    // Primero, intentamos validar el movimiento como una torre
                    isValidMoveForRook(clickedRow, clickedCol, targetRow, targetCol, clickedPiece);

                    // Si el movimiento como torre es inválido, intentamos validar el movimiento como un alfil
                    if (console.log.includes('inválido')) {
                      // Determinamos la dirección de movimiento
                      const rowIncrement = (targetRow > clickedRow) ? 1 : -1;
                      const colIncrement = (targetCol > clickedCol) ? 1 : -1;

                      // Iteramos a lo largo de la diagonal hasta que alcancemos la casilla objetivo o nos encontremos con una pieza
                      let currentRow = clickedRow + rowIncrement;
                      let currentCol = clickedCol + colIncrement;
                      while (currentRow !== targetRow && currentCol !== targetCol) {
                        // Aquí verificamos si la casilla está vacía o si contiene una pieza enemiga
                        // Si encontramos una pieza enemiga, el movimiento es válido, de lo contrario, es inválido.
                        currentRow += rowIncrement;
                        currentCol += colIncrement;
                      }
                      // Definimos targetRow y targetCol basados en la última posición en la diagonal
                      const targetRowForQueen = currentRow;
                      const targetColForQueen = currentCol;
                      // Luego, podemos llamar a la función para verificar si el movimiento es válido para la reina
                      isValidMoveForQueen(clickedRow, clickedCol, targetRowForQueen, targetColForQueen, clickedPiece);
                    }
                    break; 
            }
          } else {
              console.log('No hay pieza en esta casilla.');
          }
      });
  });
});