// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Inicializar aplicación Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173", // Permite peticiones desde Vite
      methods: ["GET", "POST"]
    }
  });
  

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Almacenamiento de los dibujos y estado
const roomsData = new Map();

// Función para crear o obtener una sala
function getOrCreateRoom(roomId) {
  if (!roomsData.has(roomId)) {
    roomsData.set(roomId, {
      drawings: [],
      users: new Set(),
      lastUpdate: Date.now()
    });
  }
  return roomsData.get(roomId);
}

// Socket.IO
io.on('connection', (socket) => {
  let currentRoom = 'default';
  
  console.log('Usuario conectado:', socket.id);
  
  // Unirse a una sala
  socket.on('join-room', (roomId) => {
    // Salir de la sala actual si está en una
    if (socket.roomId) {
      socket.leave(socket.roomId);
      const oldRoom = roomsData.get(socket.roomId);
      if (oldRoom) {
        oldRoom.users.delete(socket.id);
        io.to(socket.roomId).emit('user-count', oldRoom.users.size);
      }
    }
    
    // Unirse a la nueva sala
    currentRoom = roomId || 'default';
    socket.join(currentRoom);
    socket.roomId = currentRoom;
    
    // Actualizar datos de la sala
    const room = getOrCreateRoom(currentRoom);
    room.users.add(socket.id);
    
    // Enviar estado actual al usuario que se une
    socket.emit('init-canvas', room.drawings);
    
    // Notificar a todos los usuarios en la sala
    io.to(currentRoom).emit('user-count', room.users.size);
    
    console.log(`Usuario ${socket.id} se unió a la sala ${currentRoom}`);
  });
  
  // Manejador para nuevos objetos de dibujo
  socket.on('draw-object', (drawingObject) => {
    if (!socket.roomId) return;
    
    const room = getOrCreateRoom(socket.roomId);
    
    // Asignar un ID único al objeto si no tiene
    if (!drawingObject.id) {
      drawingObject.id = uuidv4();
    }
    
    // Guardar o actualizar el objeto
    const existingIndex = room.drawings.findIndex(obj => obj.id === drawingObject.id);
    if (existingIndex !== -1) {
      room.drawings[existingIndex] = drawingObject;
    } else {
      room.drawings.push(drawingObject);
    }
    
    room.lastUpdate = Date.now();
    
    // Emitir a todos los demás clientes en la sala
    socket.to(socket.roomId).emit('draw-object', drawingObject);
  });
  
  // Modificar un objeto existente
  socket.on('update-object', (objectId, updates) => {
    if (!socket.roomId) return;
    
    const room = getOrCreateRoom(socket.roomId);
    const objectIndex = room.drawings.findIndex(obj => obj.id === objectId);
    
    if (objectIndex !== -1) {
      room.drawings[objectIndex] = {...room.drawings[objectIndex], ...updates};
      room.lastUpdate = Date.now();
      
      socket.to(socket.roomId).emit('update-object', objectId, updates);
    }
  });
  
  // Eliminar un objeto
  socket.on('delete-object', (objectId) => {
    if (!socket.roomId) return;
    
    const room = getOrCreateRoom(socket.roomId);
    room.drawings = room.drawings.filter(obj => obj.id !== objectId);
    room.lastUpdate = Date.now();
    
    socket.to(socket.roomId).emit('delete-object', objectId);
  });
  
  // Limpiar el canvas
  socket.on('clear-canvas', () => {
    if (!socket.roomId) return;
    
    const room = getOrCreateRoom(socket.roomId);
    room.drawings = [];
    room.lastUpdate = Date.now();
    
    socket.to(socket.roomId).emit('clear-canvas');
  });
  
  // Sincronizar los trazos de dibujo libre (herramienta "pen")
  socket.on('draw-path', (pathData) => {
    if (!socket.roomId) return;
    
    socket.to(socket.roomId).emit('draw-path', pathData);
  });
  
  // Desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    if (socket.roomId && roomsData.has(socket.roomId)) {
      const room = roomsData.get(socket.roomId);
      room.users.delete(socket.id);
      
      // Notificar a los demás usuarios
      io.to(socket.roomId).emit('user-count', room.users.size);
      
      // Limpiar salas vacías después de un tiempo
      if (room.users.size === 0) {
        setTimeout(() => {
          if (roomsData.has(socket.roomId)) {
            const currentRoom = roomsData.get(socket.roomId);
            if (currentRoom.users.size === 0) {
              roomsData.delete(socket.roomId);
              console.log(`Sala ${socket.roomId} eliminada por inactividad`);
            }
          }
        }, 3600000); // 1 hora de inactividad
      }
    }
  });
});

// API endpoints
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Crear nueva sala
app.get('/api/create-room', (req, res) => {
  const roomId = uuidv4();
  getOrCreateRoom(roomId);
  res.json({ roomId });
});

// Obtener lista de salas activas
app.get('/api/active-rooms', (req, res) => {
  const activeRooms = [];
  
  roomsData.forEach((data, roomId) => {
    if (data.users.size > 0) {
      activeRooms.push({
        id: roomId,
        userCount: data.users.size,
        lastUpdate: data.lastUpdate
      });
    }
  });
  
  res.json({ rooms: activeRooms });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});