// URL del servidor WebSocket público para pruebas
const socketUrl = "wss://echo.websocket.events";
const socket = new WebSocket(socketUrl);

// Elementos del DOM
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

// Conectar con el servidor WebSocket
socket.addEventListener("open", () => {
    console.log("Conectado al servidor WebSocket");
    addMessage("Conectado al chat en tiempo real!");
});

// Manejar mensajes recibidos
socket.addEventListener("message", (event) => {
    addMessage(`Servidor: ${event.data}`);
});

// Manejar errores
socket.addEventListener("error", (error) => {
    console.error("Error en WebSocket:", error);
    addMessage("Error en la conexión WebSocket");
});

// Manejar cierre de la conexión
socket.addEventListener("close", () => {
    console.log("Conexión cerrada");
    addMessage("Conexión cerrada");
});

// Función para enviar mensajes
function sendMessage() {
    const message = messageInput.value.trim();
    if (message === "") return;

    // Enviar mensaje al servidor
    socket.send(message);
    addMessage(`Tú: ${message}`);
    messageInput.value = "";
}

// Función para añadir mensajes al chat
function addMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Hacer scroll hacia abajo
}

// Función para limpiar los mensajes del chat
function clearMessages() {
    messagesDiv.innerHTML = "";
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    messageInput.value = "";
}