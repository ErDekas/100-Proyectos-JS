// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static("public"));

// Manejar conexiones de Socket.IO
io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    // Escuchar mensajes del cliente
    socket.on("chatMessage", ({ message, sender }) => {
        console.log(`Mensaje de ${sender}: ${message}`);
        // Retransmitir el mensaje a todos los clientes, incluyendo al remitente
        io.emit("chatMessage", { message, sender });
    });

    // Manejar desconexión del cliente
    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
    });
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
