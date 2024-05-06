document.addEventListener('DOMContentLoaded', () => {

    const chessboard = document.querySelector('.chessboard');

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
});