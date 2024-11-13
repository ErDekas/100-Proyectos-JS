// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://whateka.vercel.app/",
    methods: ["GET", "POST"],
  },
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Ruta para servir el HTML principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Manejo de Socket.IO
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("chatMessage", ({ message, sender }) => {
    console.log(`Mensaje de ${sender}: ${message}`);
    // Emitir el mensaje a todos los demás clientes
    socket.broadcast.emit("chatMessage", { message, sender });
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Exportar como una función handler para Vercel
module.exports = server;
