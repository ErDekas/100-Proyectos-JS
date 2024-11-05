const words = ["JAVASCRIPT", "HTML", "CSS", "AHORCADO", "CODIGO"];
let selectedWord = "";
let guessedLetters = [];
let mistakes = 0;
const maxMistakes = 6;
let timeRemaining = 60; // Tiempo límite de 1 minuto (60 segundos)
let timerInterval;

const wordDisplay = document.getElementById("wordDisplay");
const lettersContainer = document.getElementById("lettersContainer");
const message = document.getElementById("message");
const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");
const timerDisplay = document.getElementById("timer");

function startGame() {
  // Reinicia variables
  selectedWord = words[Math.floor(Math.random() * words.length)];
  guessedLetters = [];
  mistakes = 0;
  timeRemaining = 60; // Reinicia el tiempo a 60 segundos
  message.textContent = "";

  // Configura el tablero de letras
  wordDisplay.textContent = "_ ".repeat(selectedWord.length);
  lettersContainer.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const button = document.createElement("button");
    button.textContent = letter;
    button.onclick = () => guessLetter(letter);
    lettersContainer.appendChild(button);
  }

  // Limpia el canvas y reinicia el temporizador
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clearInterval(timerInterval); // Detiene cualquier temporizador previo
  startTimer(); // Inicia el temporizador
}

function startTimer() {
  timerDisplay.textContent = `Tiempo restante: ${timeRemaining} segundos`;
  timerInterval = setInterval(() => {
    timeRemaining--;
    timerDisplay.textContent = `Tiempo restante: ${timeRemaining} segundos`;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      endGame("Tiempo agotado. La palabra era: " + selectedWord);
    }
  }, 1000);
}

function guessLetter(letter) {
  if (guessedLetters.includes(letter)) return;
  guessedLetters.push(letter);

  // Selecciona todos los botones y encuentra el que tiene el texto de la letra
  const buttons = document.querySelectorAll("button");
  const button = Array.from(buttons).find((btn) => btn.textContent === letter);

  if (selectedWord.includes(letter)) {
    updateWordDisplay();
    checkWin();
  } else {
    mistakes++;
    drawHangman();
    checkLose();
    // Si la letra es incorrecta, oculta el botón aplicando la clase 'hidden'
    if (button) button.classList.add("hidden");
  }

  // Desactiva el botón de la letra presionada si existe
  if (button) button.disabled = true;
}

function updateWordDisplay() {
  const display = selectedWord
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");
  wordDisplay.textContent = display;
}

function checkWin() {
  if (!wordDisplay.textContent.includes("_")) {
    endGame("¡Ganaste! 🎉");
  }
}

function checkLose() {
  if (mistakes >= maxMistakes) {
    endGame(`Perdiste. La palabra era: ${selectedWord}`);
  }
}

function endGame(messageText) {
  // Muestra el mensaje final, detiene el temporizador y desactiva los botones
  message.textContent = messageText;
  clearInterval(timerInterval); // Detiene el temporizador
  disableAllButtons();
}

function disableAllButtons() {
  const buttons = lettersContainer.querySelectorAll("button");
  buttons.forEach((button) => (button.disabled = true));
}

function drawHangman() {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#333";
  if (mistakes === 1) {
    ctx.beginPath();
    ctx.moveTo(20, 180);
    ctx.lineTo(180, 180);
    ctx.stroke();
  } else if (mistakes === 2) {
    ctx.beginPath();
    ctx.moveTo(40, 180);
    ctx.lineTo(40, 20);
    ctx.lineTo(120, 20);
    ctx.lineTo(120, 40);
    ctx.stroke();
  } else if (mistakes === 3) {
    ctx.beginPath();
    ctx.arc(120, 50, 10, 0, Math.PI * 2);
    ctx.stroke();
  } else if (mistakes === 4) {
    ctx.beginPath();
    ctx.moveTo(120, 60);
    ctx.lineTo(120, 100);
    ctx.stroke();
  } else if (mistakes === 5) {
    ctx.beginPath();
    ctx.moveTo(120, 70);
    ctx.lineTo(100, 90);
    ctx.stroke();
    ctx.moveTo(120, 70);
    ctx.lineTo(140, 90);
    ctx.stroke();
  } else if (mistakes === 6) {
    ctx.beginPath();
    ctx.moveTo(120, 100);
    ctx.lineTo(100, 130);
    ctx.stroke();
    ctx.moveTo(120, 100);
    ctx.lineTo(140, 130);
    ctx.stroke();
  }
}

document.addEventListener("keydown", (event) => {
  const letter = event.key.toUpperCase(); // "A", "1", "Enter", "ArrowRight", etc.
  if (/^[A-Z]$/.test(letter)) {
    guessLetter(letter);
  } else if (event.key === "Escape") {
    startGame();
  }
});

// Inicia el juego al cargar la página
startGame();
