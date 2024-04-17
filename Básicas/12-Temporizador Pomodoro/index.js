// Función para iniciar el temporizador pomodoro
function iniciarPomodoro() {
    const tiempoTrabajo = 25 * 60; // 25 minutos en segundos
    const tiempoDescanso = 5 * 60; // 5 minutos en segundos
    let tiempoRestante = tiempoTrabajo;
    let enDescanso = false;

    // Función para actualizar el tiempo restante en el temporizador
    function actualizarTiempoRestante() {
        const minutos = Math.floor(tiempoRestante / 60);
        let segundos = tiempoRestante % 60;
        segundos = segundos < 10 ? `0${segundos}` : segundos;
        document.getElementById('tiempo-restante').innerText = `${minutos}:${segundos}`;
    }

    // Función para iniciar el temporizador
    function iniciarTemporizador() {
        const temporizador = setInterval(() => {
            if (tiempoRestante > 0) {
                tiempoRestante--;
                actualizarTiempoRestante();
            } else {
                clearInterval(temporizador);
                if (enDescanso) {
                    tiempoRestante = tiempoTrabajo;
                    enDescanso = false;
                } else {
                    tiempoRestante = tiempoDescanso;
                    enDescanso = true;
                }
                iniciarTemporizador();
            }
        }, 1000); // Actualizar cada segundo
    }

    // Iniciar el temporizador por primera vez
    iniciarTemporizador();
}
// Llamar a la función para iniciar el temporizador cuando se carga la página
window.onload = iniciarPomodoro;
