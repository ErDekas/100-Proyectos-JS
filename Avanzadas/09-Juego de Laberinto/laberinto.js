const canvas = document.getElementById("miCanvas");
canvas.width = 600; // Ajusta el ancho según el tamaño del contenedor
canvas.height = 400; // Ajusta el alto según el tamaño del contenedor
const ctx = canvas.getContext("2d");
const cellSize = 15; // Tamaño de cada celda en el laberinto
let tiempoInicio = null;
let tiempoFin = null;
let cronometroIntervalo = null;

// Marcar las coordenadas (2, 1) y (17, 30)
const markCoordinates = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(y * cellSize, x * cellSize, cellSize, cellSize);
};

markCoordinates(16, 29, "#87CEEB"); // Marcar coordenada (17, 30) en azul
// Laberinto aún más grande con más obstáculos
const laberinto = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,],
  [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,],
  [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1,],
  [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1,],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1,],
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
  [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1,],
  [1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1,],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,],
  [1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
];

let playerX = 0; // Posición inicial en la matriz del laberinto
let playerY = 1;

function drawLaberinto() {
  for (let y = 0; y < laberinto.length; y++) {
    for (let x = 0; x < laberinto[y].length; x++) {
      if (laberinto[y][x] === 1) {
        ctx.fillStyle = "#C0C0C0"; // Color de las paredes
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(playerX * cellSize, playerY * cellSize, cellSize, cellSize);
}

function clearPlayer() {
  ctx.clearRect(playerX * cellSize, playerY * cellSize, cellSize, cellSize);
}

function movePlayer(direction) {
  clearPlayer();

  if (direction === "up" && laberinto[playerY - 1][playerX] === 0) {
    playerY -= 1;
  } else if (direction === "down" && laberinto[playerY + 1][playerX] === 0) {
    playerY += 1;
  } else if (direction === "left" && laberinto[playerY][playerX - 1] === 0) {
    playerX -= 1;
  } else if (direction === "right" && laberinto[playerY][playerX + 1] === 0) {
    playerX += 1;
  }

  drawPlayer();
  verificarPuntoAzul(playerX, playerY); // Llama a la función para verificar si el jugador llegó al punto azul
}

function verificarPuntoAzul(x, y) {
  if (x === 29 && y === 16) {
    // Coordenadas del punto azul
    detenerCronometro();
  }
}

function iniciarCronometro() {
  tiempoInicio = new Date().getTime();
  cronometroIntervalo = setInterval(actualizarCronometro, 1000);
}

function reiniciarJuego() {
  playerX = 0; // Posición inicial en la matriz del laberinto
  playerY = 1;
  drawLaberinto(); // Dibujar el laberinto nuevamente
  drawPlayer(); // Dibujar al jugador nuevamente en el laberinto
  iniciarCronometro(); // Reiniciar el cronómetro
}

function detenerCronometro() {
  tiempoFin = new Date().getTime();
  clearInterval(cronometroIntervalo);
  const tiempoTranscurrido = (tiempoFin - tiempoInicio) / 1000; // en segundos
  alert(`¡Lo has resuelto en ${tiempoTranscurrido} segundos!`);
  reiniciarJuego();
  markCoordinates(16, 29, "#87CEEB"); // Marcar coordenada (17, 30) en azul
}

function actualizarCronometro() {
  const tiempoActual = new Date().getTime();
  const tiempoTranscurrido = (tiempoActual - tiempoInicio) / 1000; // en segundos
  console.log(`Tiempo transcurrido: ${tiempoTranscurrido} segundos`);
  // Aquí puedes actualizar un elemento en la interfaz con el tiempo transcurrido
}

drawLaberinto(); // Dibujar el laberinto inicialmente

drawPlayer(); // Dibujar al jugador inicialmente en el laberinto

// Event listener para las teclas de dirección
document.addEventListener("keydown", function (event) {
  const key = event.key;
  if (
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "ArrowLeft" ||
    key === "ArrowRight"
  ) {
    if (!tiempoInicio) {
      iniciarCronometro(); // Inicia el cronómetro si aún no ha comenzado
    }
    movePlayer(key.replace("Arrow", "").toLowerCase());
  }
});

const toggleMode = () => {
  const body = document.body;
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    body.style.backgroundColor = "#333";
    h1.style.color = "#fff";
  } else {
    body.style.backgroundColor = "#fff";
    h1.style.color = "#333";
  }
};