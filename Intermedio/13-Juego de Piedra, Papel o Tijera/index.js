// Referencias a los elementos del DOM
const resultDiv = document.getElementById("result");
const choices = document.querySelectorAll(".choice");

// Función para generar la elección de la computadora
function obtenerEleccionComputadora() {
  const opciones = ["piedra", "papel", "tijera"];
  const randomIndex = Math.floor(Math.random() * 3);
  return opciones[randomIndex];
}

// Función para determinar el ganador
function determinarGanador(usuario, computadora) {
  if (usuario === computadora) {
    return "¡Es un empate!";
  }

  if (
    (usuario === "piedra" && computadora === "tijera") ||
    (usuario === "papel" && computadora === "piedra") ||
    (usuario === "tijera" && computadora === "papel")
  ) {
    return "¡Ganaste!";
  }

  return "¡Perdiste!";
}

// Función para manejar la elección del usuario
function manejarEleccionUsuario(eleccionUsuario) {
  const eleccionComputadora = obtenerEleccionComputadora();
  const resultado = determinarGanador(eleccionUsuario, eleccionComputadora);

  // Mostrar el resultado
  resultDiv.innerHTML = `
    <h2>Tu elección: ${eleccionUsuario}</h2>
    <h2>Elección de la computadora: ${eleccionComputadora}</h2>
    <h2>${resultado}</h2>
  `;
}

// Asignar un evento a cada opción
choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    const eleccion = choice.id; // piedra, papel o tijera
    manejarEleccionUsuario(eleccion);
  });
});

// Referencia al botón de reiniciar
const botonReiniciar = document.getElementById('restart');

// Función para reiniciar el juego
function reiniciarJuego() {
  // Resetear el texto del resultado
  resultDiv.innerHTML = `<h2>Elige una opción para jugar</h2>`;
}

// Evento para el botón de reiniciar
botonReiniciar.addEventListener('click', reiniciarJuego);
