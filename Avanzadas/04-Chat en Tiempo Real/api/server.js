// api/server.js
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permitir todas las conexiones (puedes ajustarlo para producción)
    methods: ["GET", "POST"],
  },
});

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  // Manejar mensajes del cliente
  socket.on("chatMessage", ({ message, sender }) => {
    console.log(`Mensaje de ${sender}: ${message}`);
    // Retransmitir el mensaje a todos los demás clientes
    socket.broadcast.emit("chatMessage", { message, sender });
  });

  // Manejar desconexión del cliente
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

module.exports = (req, res) => {
  server.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
  });
};
