// Firebase config
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { authService } from "./auth.js";
import { io } from "socket.io-client";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const db = getFirestore(authService.app);

const state = {
  currentUser: null,
  currentTool: "select",
  isDrawing: false,
  drawings: [],
  currentColor: "#000000",
  lineWidth: 2,
  undoStack: [],
  redoStack: [],
};

let socket;
let currentRoomId = null;

function initSocketConnection() {
  socket = io("http://localhost:3000");

  // Eventos de socket
  socket.on("connect", () => {
    console.log("Conectado al servidor");
    joinRoom(currentRoomId || "default");
  });

  socket.on("disconnect", () => {
    console.log("Desconectado del servidor");
  });

  socket.on("init-canvas", (drawings) => {
    // Inicializar el canvas con los dibujos existentes
    state.drawings = drawings;
    canvasManager.redrawCanvas();
  });

  socket.on("draw-object", (drawingObject) => {
    // Recibir un nuevo objeto de dibujo
    const existingIndex = state.drawings.findIndex(
      (obj) => obj.id === drawingObject.id
    );

    if (existingIndex !== -1) {
      state.drawings[existingIndex] = drawingObject;
    } else {
      state.drawings.push(drawingObject);
    }

    canvasManager.redrawCanvas();
  });

  socket.on("update-object", (objectId, updates) => {
    // Actualizar un objeto existente
    const objectIndex = state.drawings.findIndex((obj) => obj.id === objectId);

    if (objectIndex !== -1) {
      state.drawings[objectIndex] = {
        ...state.drawings[objectIndex],
        ...updates,
      };
      canvasManager.redrawCanvas();
    }
  });

  socket.on("delete-object", (objectId) => {
    // Eliminar un objeto
    state.drawings = state.drawings.filter((obj) => obj.id !== objectId);
    canvasManager.redrawCanvas();
  });

  socket.on("clear-canvas", () => {
    // Limpiar todo el canvas
    state.drawings = [];
    canvasManager.redrawCanvas();
  });

  socket.on("draw-path", (pathData) => {
    // Dibujar un trazo de lápiz en tiempo real
    if (pathData.type === "start") {
      canvasManager.ctx.beginPath();
      canvasManager.ctx.moveTo(pathData.x, pathData.y);
      canvasManager.ctx.strokeStyle = pathData.color;
      canvasManager.ctx.lineWidth = pathData.width;
      
      // Store the active remote path ID for tracking
      state.activeRemotePaths = state.activeRemotePaths || {};
      state.activeRemotePaths[pathData.pathId] = {
        color: pathData.color,
        width: pathData.width,
        points: [{x: pathData.x, y: pathData.y}]
      };
      
    } else if (pathData.type === "move") {
      canvasManager.ctx.lineTo(pathData.x, pathData.y);
      canvasManager.ctx.stroke();
      
      // Add to the tracked remote path if we have it
      if (state.activeRemotePaths && state.activeRemotePaths[pathData.pathId]) {
        state.activeRemotePaths[pathData.pathId].points.push({x: pathData.x, y: pathData.y});
      }
    }
  });

  socket.on("user-count", (count) => {
    // Actualizar contador de usuarios
    document.querySelector(
      "#user-count"
    ).textContent = `Usuarios en línea: ${count}`;
  });
}

function joinRoom(roomId) {
  currentRoomId = roomId || "default";
  if (socket && socket.connected) {
    socket.emit("join-room", currentRoomId);
  }
}

// Canvas setup
class CanvasManager {
  constructor() {
    this.canvasArea = document.querySelector(".canvas-area");
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    // Propiedades para la selección
    this.selectedObject = null;
    this.selectionBox = null;
    this.contextMenu = null;

    this.setupCanvas();
    this.bindEvents();
    this.createContextMenu();
  }

  setupCanvas() {
    this.canvas.width = this.canvasArea.clientWidth;
    this.canvas.height = this.canvasArea.clientHeight;
    this.canvas.style.display = "block";
    this.canvasArea.appendChild(this.canvas);

    // Set initial styles
    this.ctx.strokeStyle = state.currentColor;
    this.ctx.lineWidth = state.lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  // Save canvas state for undo/redo
  saveState() {
    state.undoStack.push(
      this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    );
    state.redoStack = []; // Clear redo stack when new action is performed
  }

  undo() {
    if (state.undoStack.length > 0) {
      state.redoStack.push(
        this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
      const imageData = state.undoStack.pop();
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  redo() {
    if (state.redoStack.length > 0) {
      state.undoStack.push(
        this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
      const imageData = state.redoStack.pop();
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  bindEvents() {
    // Mouse events
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

    // Touch events for mobile support
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));

    // Window resize
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  createContextMenu() {
    this.contextMenu = document.createElement("div");
    this.contextMenu.className = "context-menu";
    this.contextMenu.style.display = "none";
    this.contextMenu.innerHTML = `
      <div class="context-menu-item" data-action="delete">Eliminar</div>
      <div class="context-menu-item" data-action="duplicate">Duplicar</div>
      <div class="context-menu-item" data-action="bringToFront">Traer al frente</div>
      <div class="context-menu-item" data-action="sendToBack">Enviar atrás</div>
      <div class="context-menu-item" data-action="properties">Propiedades</div>
    `;

    document.body.appendChild(this.contextMenu);

    // Agregar eventos a los elementos del menú
    const menuItems = this.contextMenu.querySelectorAll(".context-menu-item");
    menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        this.handleContextMenuAction(action);
        this.contextMenu.style.display = "none";
      });
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener("click", (e) => {
      if (!this.contextMenu.contains(e.target)) {
        this.contextMenu.style.display = "none";
      }
    });
  }
  // Método para manejar las acciones del menú contextual
  handleContextMenuAction(action) {
    if (!this.selectedObject) return;

    switch (action) {
      case "delete":
        // Obtener ID antes de eliminar
        const objectId = this.selectedObject.id;

        // Eliminar el objeto seleccionado
        state.drawings = state.drawings.filter(
          (obj) => obj !== this.selectedObject
        );
        this.selectedObject = null;
        this.redrawCanvas();

        // Sincronizar la eliminación
        if (socket && socket.connected && objectId) {
          socket.emit("delete-object", objectId);
        }
        break;
      case "duplicate":
        // Duplicar el objeto seleccionado
        const duplicate = {
          ...this.selectedObject,
          x: this.selectedObject.x + 20,
          y: this.selectedObject.y + 20,
        };
        state.drawings.push(duplicate);
        this.selectedObject = duplicate;
        this.redrawCanvas();
        break;
      case "bringToFront":
        // Traer al frente
        const index = state.drawings.indexOf(this.selectedObject);
        if (index !== -1) {
          state.drawings.splice(index, 1);
          state.drawings.push(this.selectedObject);
          this.redrawCanvas();
        }
        break;
      case "sendToBack":
        // Enviar atrás
        const idx = state.drawings.indexOf(this.selectedObject);
        if (idx !== -1) {
          state.drawings.splice(idx, 1);
          state.drawings.unshift(this.selectedObject);
          this.redrawCanvas();
        }
        break;
      case "properties":
        // Abrir panel de propiedades (puedes implementar esto más adelante)
        alert("Funcionalidad de propiedades en desarrollo");
        break;
    }
  }

  clearCanvas() {
    state.drawings = [];
    state.undoStack = [];
    state.redoStack = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Sincronizar limpieza
    if (socket && socket.connected) {
      socket.emit("clear-canvas");
    }
  }

  // Event handlers
  handleMouseDown(e) {
    state.isDrawing = true;
    state.startX = e.offsetX;
    state.startY = e.offsetY;

    this.saveState();

    if (state.currentTool === "select") {
      // Comprobar si se hizo clic en algún objeto existente
      for (let i = state.drawings.length - 1; i >= 0; i--) {
        const obj = state.drawings[i];
        if (this.isPointInObject(state.startX, state.startY, obj)) {
          this.selectedObject = obj;
          // Mostrar el menú contextual
          this.contextMenu.style.display = "block";
          this.contextMenu.style.top = e.clientY + "px";
          this.contextMenu.style.left = e.clientX + "px";
          this.redrawCanvas();
          return;
        }
      }

      // Si no se hizo clic en ningún objeto, deseleccionar
      this.selectedObject = null;
      this.redrawCanvas();
    } else if (state.currentTool === "eraser") {
      // Iniciar el borrado
      this.ctx.beginPath();
      this.ctx.moveTo(state.startX, state.startY);
      // Guardamos temporalmente el color y ancho originales
      this.savedColor = this.ctx.strokeStyle;
      this.savedWidth = this.ctx.lineWidth;
      // Configuramos el borrador como un trazo blanco grueso
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 20; // Ancho del borrador, ajustable
    } else if (state.currentTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = state.currentColor;
        this.ctx.fillText(text, state.startX, state.startY);

        // Crear un objeto de texto con ID único
        const textObj = {
          id: Date.now().toString(),
          type: "text",
          x: state.startX,
          y: state.startY,
          text: text,
          color: state.currentColor,
          font: "16px Arial",
        };

        // Guardar y sincronizar
        state.drawings.push(textObj);
        if (socket && socket.connected) {
          socket.emit("draw-object", textObj);
        }
      }
    } else if (state.currentTool === "pen") {
      this.ctx.beginPath();
      this.ctx.moveTo(state.startX, state.startY);
    
      // Iniciar un nuevo objeto de dibujo
      const pathId = Date.now().toString();
      state.currentPath = {
        id: pathId,
        type: "path",
        color: state.currentColor,
        width: state.lineWidth,
        points: [{ x: state.startX, y: state.startY }],
      };
    
      // Emitir inicio del trazo con ID incluido
      if (socket && socket.connected) {
        socket.emit("draw-path", {
          type: "start",
          pathId: pathId,  // Include the path ID
          x: state.startX,
          y: state.startY,
          color: state.currentColor,
          width: state.lineWidth,
        });
      }
    }
  }

  handleMouseMove(e) {
    if (!state.isDrawing) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    if (state.currentTool === "select" && this.selectedObject) {
      // Mover el objeto seleccionado
      const dx = currentX - state.startX;
      const dy = currentY - state.startY;

      this.selectedObject.x += dx;
      this.selectedObject.y += dy;

      state.startX = currentX;
      state.startY = currentY;

      this.redrawCanvas();
      if (socket && socket.connected) {
        socket.emit("update-object", this.selectedObject.id, {
          x: this.selectedObject.x,
          y: this.selectedObject.y,
        });
      }
    } else if (state.currentTool === "eraser") {
      // Dibujar el trazo del borrador
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
    } else if (["square", "circle", "arrow"].includes(state.currentTool)) {
      // Crear un canvas temporal para la vista previa
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      // Copiar el estado actual del canvas
      tempCtx.putImageData(state.undoStack[state.undoStack.length - 1], 0, 0);

      // Dibujar la nueva forma
      this.drawShape(
        tempCtx,
        state.currentTool,
        state.startX,
        state.startY,
        currentX,
        currentY
      );

      // Limpiar el canvas principal y dibujar el canvas temporal
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(tempCanvas, 0, 0);
    } else if (state.currentTool === "pen") {
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
    
      // Add path data
      state.currentPath.points.push({ x: currentX, y: currentY });
    
      // Enhance the emission with more context information
      if (socket && socket.connected) {
        socket.emit("draw-path", {
          type: "move",
          x: currentX,
          y: currentY,
          pathId: state.currentPath.id  // Include the path ID
        });
      }
    }
  }

  handleMouseUp(e) {
    if (!state.isDrawing) return;

    state.isDrawing = false;

    if (state.currentTool === "eraser") {
      // Restaurar el color y ancho original después de borrar
      this.ctx.strokeStyle = this.savedColor;
      this.ctx.lineWidth = this.savedWidth;
    } else if (state.currentTool === "pen") {
      // Finalizar y guardar el camino
      if (state.currentPath) {
        state.drawings.push(state.currentPath);

        // Sincronizar el trazo completo
        if (socket && socket.connected) {
          socket.emit("draw-object", state.currentPath);
        }

        state.currentPath = null;
      }
    } else if (["square", "circle", "arrow"].includes(state.currentTool)) {
      const endX = e.offsetX;
      const endY = e.offsetY;
      const shapeId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

      // Crear objeto con ID único
      const shapeObj = {
        id: shapeId,
        type: state.currentTool,
        x1: state.startX,
        y1: state.startY,
        x2: endX,
        y2: endY,
        color: state.currentColor,
        width: state.lineWidth,
      };

      // Guardar la forma en state.drawings
      state.drawings.push(shapeObj);

      // Save the shape and sync
      state.drawings.push(shapeObj);

      if (socket && socket.connected) {
        console.log("Emitting draw-object:", shapeObj);
        socket.emit("draw-object", shapeObj);
      }

      this.drawShape(
        this.ctx,
        state.currentTool,
        state.startX,
        state.startY,
        endX,
        endY
      );
    }

    this.ctx.beginPath();
  }

  // Touch event handlers
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.handleMouseDown({ offsetX: x, offsetY: y });
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.handleMouseMove({ offsetX: x, offsetY: y });
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.handleMouseUp(e);
  }

  handleResize() {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.canvas.width = this.canvasArea.clientWidth;
    this.canvas.height = this.canvasArea.clientHeight;
    this.ctx.putImageData(imageData, 0, 0);
  }

  drawShape(context, tool, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = state.currentColor;
    context.lineWidth = state.lineWidth;

    switch (tool) {
      case "square":
        const width = x2 - x1;
        const height = y2 - y1;
        context.strokeRect(x1, y1, width, height);
        break;
      case "circle":
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        context.arc(x1, y1, radius, 0, 2 * Math.PI);
        context.stroke();
        break;
      case "arrow":
        // Draw line
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);

        // Calculate arrow head
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 15;

        context.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        context.stroke();
        break;
    }
  }
  // Método para comprobar si un punto está dentro de un objeto
  isPointInObject(x, y, obj) {
    switch (obj.type) {
      case "square":
        const minX = Math.min(obj.x1, obj.x2);
        const maxX = Math.max(obj.x1, obj.x2);
        const minY = Math.min(obj.y1, obj.y2);
        const maxY = Math.max(obj.y1, obj.y2);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;

      case "circle":
        const distance = Math.sqrt(
          Math.pow(x - obj.x1, 2) + Math.pow(y - obj.y1, 2)
        );
        const radius = Math.sqrt(
          Math.pow(obj.x2 - obj.x1, 2) + Math.pow(obj.y2 - obj.y1, 2)
        );
        return distance <= radius;

      case "arrow":
        // Simplificación: comprobar si está cerca de la línea de la flecha
        // Este es un enfoque simplificado, podrías mejorarlo
        const distToLine = this.distanceToLine(
          x,
          y,
          obj.x1,
          obj.y1,
          obj.x2,
          obj.y2
        );
        return distToLine < 10; // 10 píxeles de tolerancia

      case "text":
        // Simplificación: comprobar si está en un área rectangular alrededor del texto
        return (
          x >= obj.x - 5 &&
          x <= obj.x + 100 &&
          y >= obj.y - 20 &&
          y <= obj.y + 5
        );

      case "path":
        // Simplificación: comprobar si está cerca de cualquier punto del camino
        for (const point of obj.points) {
          const dist = Math.sqrt(
            Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
          );
          if (dist < 10) return true;
        }
        return false;

      default:
        return false;
    }
  }

  // Función auxiliar para calcular la distancia de un punto a una línea
  distanceToLine(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) {
      param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  // Método para redibujar el canvas completo
  redrawCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar todos los objetos
    for (const obj of state.drawings) {
      this.drawObject(obj);
    }

    // Dibujar borde de selección si hay un objeto seleccionado
    if (this.selectedObject) {
      this.drawSelectionBorder(this.selectedObject);
    }
  }

  // Método para dibujar un objeto en el canvas
  drawObject(obj) {
    switch (obj.type) {
      case "square":
        this.ctx.beginPath();
        this.ctx.strokeStyle = obj.color;
        this.ctx.lineWidth = obj.width;
        const width = obj.x2 - obj.x1;
        const height = obj.y2 - obj.y1;
        this.ctx.strokeRect(obj.x1, obj.y1, width, height);
        break;

      case "circle":
        this.ctx.beginPath();
        this.ctx.strokeStyle = obj.color;
        this.ctx.lineWidth = obj.width;
        const radius = Math.sqrt(
          Math.pow(obj.x2 - obj.x1, 2) + Math.pow(obj.y2 - obj.y1, 2)
        );
        this.ctx.arc(obj.x1, obj.y1, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;

      case "arrow":
        this.ctx.beginPath();
        this.ctx.strokeStyle = obj.color;
        this.ctx.lineWidth = obj.width;

        // Dibujar línea
        this.ctx.moveTo(obj.x1, obj.y1);
        this.ctx.lineTo(obj.x2, obj.y2);

        // Calcular punta de flecha
        const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
        const headLength = 15;

        this.ctx.lineTo(
          obj.x2 - headLength * Math.cos(angle - Math.PI / 6),
          obj.y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(obj.x2, obj.y2);
        this.ctx.lineTo(
          obj.x2 - headLength * Math.cos(angle + Math.PI / 6),
          obj.y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();
        break;

      case "text":
        this.ctx.font = obj.font;
        this.ctx.fillStyle = obj.color;
        this.ctx.fillText(obj.text, obj.x, obj.y);
        break;

      case "path":
        if (obj.points && obj.points.length > 0) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = obj.color;
          this.ctx.lineWidth = obj.width;
          this.ctx.moveTo(obj.points[0].x, obj.points[0].y);

          for (let i = 1; i < obj.points.length; i++) {
            this.ctx.lineTo(obj.points[i].x, obj.points[i].y);
          }

          this.ctx.stroke();
        }
        break;
    }
  }

  // Método para dibujar el borde de selección
  drawSelectionBorder(obj) {
    this.ctx.setLineDash([5, 3]);
    this.ctx.strokeStyle = "#1E90FF"; // Azul para el borde de selección
    this.ctx.lineWidth = 2;

    switch (obj.type) {
      case "square":
        const width = obj.x2 - obj.x1;
        const height = obj.y2 - obj.y1;
        // Dibujar el rectángulo con un margen de 5px
        this.ctx.strokeRect(obj.x1 - 5, obj.y1 - 5, width + 10, height + 10);
        break;

      case "circle":
        const radius = Math.sqrt(
          Math.pow(obj.x2 - obj.x1, 2) + Math.pow(obj.y2 - obj.y1, 2)
        );
        this.ctx.beginPath();
        this.ctx.arc(obj.x1, obj.y1, radius + 5, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;

      case "arrow":
        // Dibujar un rectángulo que encierre la flecha
        const minX = Math.min(obj.x1, obj.x2) - 5;
        const minY = Math.min(obj.y1, obj.y2) - 5;
        const maxX = Math.max(obj.x1, obj.x2) + 5;
        const maxY = Math.max(obj.y1, obj.y2) + 5;
        this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        break;

      case "text":
        // Rectángulo alrededor del texto
        this.ctx.strokeRect(obj.x - 5, obj.y - 20, 110, 25);
        break;

      case "path":
        // Dibujar un rectángulo que encierre todos los puntos del camino
        if (obj.points && obj.points.length > 0) {
          let minX = obj.points[0].x;
          let minY = obj.points[0].y;
          let maxX = obj.points[0].x;
          let maxY = obj.points[0].y;

          for (const point of obj.points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          }

          this.ctx.strokeRect(
            minX - 5,
            minY - 5,
            maxX - minX + 10,
            maxY - minY + 10
          );
        }
        break;
    }

    this.ctx.setLineDash([]); // Restaurar el estilo de línea
  }
}

// UI Manager
class UIManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.setupToolbar();
    this.setupColorPicker();
    this.setupLineWidth();
    this.setupAuthUI();
  }

  setupToolbar() {
    const tools = document.querySelectorAll(".tool-button");
    tools.forEach((tool, index) => {
      tool.addEventListener("click", () => {
        tools.forEach((t) => t.classList.remove("selected"));
        tool.classList.add("selected");

        // Actualizar array de iconos para incluir el borrador
        const icons = [
          "select",
          "square",
          "circle",
          "arrow",
          "pen",
          "eraser",
          "text",
          "image",
        ];
        state.currentTool = icons[index];

        // Actualizar el cursor según la herramienta seleccionada
        if (state.currentTool === "select") {
          this.canvasManager.canvas.style.cursor = "default";
        } else if (state.currentTool === "eraser") {
          this.canvasManager.canvas.style.cursor =
            'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="white" stroke="black" stroke-width="1"/></svg>\'), auto';
        } else {
          this.canvasManager.canvas.style.cursor = "crosshair";
        }
      });
    });

    // Undo/Redo buttons
    document.querySelector("#undo-button").addEventListener("click", () => {
      this.canvasManager.undo();
    });

    document.querySelector("#redo-button").addEventListener("click", () => {
      this.canvasManager.redo();
    });
  }

  setupColorPicker() {
    const colorPicker = document.querySelector("#color-picker");
    colorPicker.addEventListener("change", (e) => {
      state.currentColor = e.target.value;
      this.canvasManager.ctx.strokeStyle = state.currentColor;
    });
  }

  setupLineWidth() {
    const lineWidth = document.querySelector("#line-width");
    lineWidth.addEventListener("change", (e) => {
      state.lineWidth = parseInt(e.target.value);
      this.canvasManager.ctx.lineWidth = state.lineWidth;
    });
  }

  setupAuthUI() {
    const loginButton = document.querySelector("#login-button");
    const logoutButton = document.querySelector("#logout-button");
    const userInfo = document.querySelector("#user-info");

    authService.setAuthStateChangeCallback((isAuthenticated, user) => {
      if (isAuthenticated) {
        userInfo.textContent = `Logged in as ${user.email}`;
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
      } else {
        userInfo.textContent = "Not logged in";
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
      }
    });

    loginButton.addEventListener("click", () => {
      authService.loginWithGoogle();
    });

    logoutButton.addEventListener("click", () => {
      authService.logout();
    });
  }
  setupRoomControls() {
    const createRoomButton = document.querySelector("#create-room");
    const joinRoomButton = document.querySelector("#join-room");
    const roomIdInput = document.querySelector("#room-id-input");

    if (createRoomButton) {
      createRoomButton.addEventListener("click", async () => {
        try {
          const response = await fetch("/api/create-room");
          const data = await response.json();

          if (data.roomId) {
            alert(`Nueva sala creada. ID: ${data.roomId}`);
            joinRoom(data.roomId);

            // Actualizar UI
            if (roomIdInput) {
              roomIdInput.value = data.roomId;
            }

            // Limpiar canvas para la nueva sala
            this.canvasManager.clearCanvas();
          }
        } catch (error) {
          console.error("Error al crear sala:", error);
        }
      });
    }

    if (joinRoomButton && roomIdInput) {
      joinRoomButton.addEventListener("click", () => {
        const roomId = roomIdInput.value.trim();
        if (roomId) {
          joinRoom(roomId);
        } else {
          alert("Por favor ingresa un ID de sala válido");
        }
      });
    }
  }
}

let canvasManager;

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  canvasManager = new CanvasManager();
  const uiManager = new UIManager(canvasManager);

  // Inicializar conexión Socket.IO
  initSocketConnection();

  // Configurar controles de sala si existen en el HTML
  if (uiManager.setupRoomControls) {
    uiManager.setupRoomControls();
  }
});
