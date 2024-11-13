const socket = io(); // Vercel automáticamente usa la misma URL base del dominio

// Elementos del DOM
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

// Manejar mensajes recibidos
socket.on("chatMessage", ({ message, sender }) => {
  addMessage(`${sender}: ${message}`, "received");
});

// Función para enviar mensajes
function sendMessage() {
  const message = messageInput.value.trim();
  const sender = "Tú";
  if (message === "") return;

  socket.emit("chatMessage", { message, sender });
  addMessage(`${sender}: ${message}`, "sent");
  messageInput.value = "";
}

// Función para añadir mensajes al chat
function addMessage(message, type) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", type);
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Conectar con el servidor de Socket.IO
socket.on("connect", () => {
  console.log("Conectado al servidor Socket.IO");
  addMessage("✅ Conectado al chat en tiempo real!", "system");
});

// Manejar desconexión
socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
  addMessage("❌ Conexión cerrada. Intentando reconectar...", "system");
});

// Manejar errores
socket.on("connect_error", (error) => {
  console.error("Error de conexión:", error);
  addMessage("⚠️ Error en la conexión con el servidor", "system");
});

function clearMessages() {
  messagesDiv.innerHTML = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  messageInput.value = "";
}

// Evento para enviar el mensaje al presionar Enter
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

messageInput.addEventListener("keydown", (event) => {
    if(event.key === "Escape") {
        clearMessages();
    }
})

messageInput.addEventListener("keydown", (event) => {
    if(event.key === "Tab") {
        messageInput.focus();
        event.preventDefault();
    }
})