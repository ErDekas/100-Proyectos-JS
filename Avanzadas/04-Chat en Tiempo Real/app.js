// Conectarse al servidor WebSocket (usando un servidor público de echo)
const socket = new WebSocket('ws://echo.websocket.org');

// Mostrar mensajes recibidos del servidor
socket.onmessage = function (event) {
    const messagesContainer = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.textContent = `Servidor: ${event.data}`;
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;  // Desplazar hacia abajo
};

// Notificar cuando la conexión se haya abierto
socket.onopen = function () {
    console.log("Conexión WebSocket establecida.");
};

// Manejar los errores de conexión
socket.onerror = function (error) {
    console.log("Error en WebSocket:", error);
};

// Notificar cuando la conexión se haya cerrado
socket.onclose = function () {
    console.log("Conexión WebSocket cerrada.");
};

// Función para enviar mensajes
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value;
    if (message.trim()) {
        socket.send(message);  // Enviar el mensaje al servidor WebSocket
        const messagesContainer = document.getElementById('messages');
        const newMessage = document.createElement('div');
        newMessage.classList.add('message');
        newMessage.textContent = `Tú: ${message}`;
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;  // Desplazar hacia abajo
    }
    input.value = '';  // Limpiar el campo de entrada
}