const symbols = ['🍎', '🍉', '🍌', '🍇', '🍊', '🍓', '🍋', '🥥'];
const gameBoard = document.getElementById('gameBoard');
let firstCard = null;
let secondCard = null;
let lockBoard = false;

// Shuffle function
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Create game board
const createGameBoard = () => {
  shuffle(symbols.concat(symbols));
  symbols.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.textContent = symbol;
    card.addEventListener('click', () => flipCard(card));
    gameBoard.appendChild(card);
  });
};

// Flip card function
const flipCard = (card) => {
  if (lockBoard) return;
  if (card === firstCard) return;

  card.classList.add('hidden');
  
  if (!firstCard) {
    firstCard = card;
  } else if (!secondCard) {
    secondCard = card;
    checkMatch();
  }
};

// Check match function
const checkMatch = () => {
  if (firstCard.textContent === secondCard.textContent) {
    disableCards();
  } else {
    unflipCards();
  }
};

// Disable cards function
const disableCards = () => {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  resetBoard();
};

// Unflip cards function
const unflipCards = () => {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('hidden');
    secondCard.classList.remove('hidden');

    resetBoard();
  }, 1000);
};

// Reset board function
const resetBoard = () => {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
};

// Initialize the game
createGameBoard();
