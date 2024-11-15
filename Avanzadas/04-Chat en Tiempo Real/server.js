const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const serverless = require("serverless-http");
require('dotenv').config();

// Crear el servidor de Express
const app = express();
app.use(express.static("public"));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static("public"));

// Manejar conexiones de Socket.IO
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("chatMessage", ({ message, sender }) => {
    console.log(`Mensaje de ${sender}: ${message}`);
    io.emit("chatMessage", { message, sender });
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Exportar la función serverless
module.exports.handler = serverless(app);

// Para pruebas locales puedes iniciar el servidor de forma tradicional
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}
