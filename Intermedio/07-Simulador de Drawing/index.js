const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// Configuraciones iniciales del lienzo y las herramientas
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let drawing = false;
let currentTool = "pencil";
let startX = 0;
let startY = 0;
let fillColor = "#000000";
let strokeWidth = 2;
let strokeStyle = "solid";
let opacity = 1;

// Función para establecer la herramienta actual
function setTool(tool) {
  currentTool = tool;
}

// Mostrar / Ocultar menú de configuración
function toggleSettingsMenu() {
  const menu = document.getElementById("settingsMenu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

// Funciones para configurar las propiedades de estilo
function setFillColor(color) {
  fillColor = color;
}

function setStrokeWidth(width) {
  strokeWidth = width;
}

function setStrokeStyle(style) {
  strokeStyle = style;
}

function setOpacity(value) {
  opacity = value;
}

// Limpiar el lienzo
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Eventos de dibujo en el lienzo
canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  drawing = true;

  // Iniciar un trazo nuevo si la herramienta es lápiz o borrador
  if (currentTool === "pencil" || currentTool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  // Configurar estilos para dibujo continuo
  ctx.strokeStyle = fillColor;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = opacity;

  // Estilos de trazo (línea continua, guiones, puntos)
  if (strokeStyle === "dashed") {
    ctx.setLineDash([10, 5]);
  } else if (strokeStyle === "dotted") {
    ctx.setLineDash([2, 2]);
  } else {
    ctx.setLineDash([]);
  }

  if (currentTool === "pencil") {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (currentTool === "eraser") {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 10;
    ctx.lineTo(x, y);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!drawing) return;
  drawing = false;

  const x = e.offsetX;
  const y = e.offsetY;

  ctx.strokeStyle = fillColor;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = opacity;

  // Configuración de estilo de trazo al finalizar
  if (strokeStyle === "dashed") {
    ctx.setLineDash([10, 5]);
  } else if (strokeStyle === "dotted") {
    ctx.setLineDash([2, 2]);
  } else {
    ctx.setLineDash([]);
  }

  if (currentTool === "line") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (currentTool === "rectangle") {
    const width = x - startX;
    const height = y - startY;
    ctx.strokeRect(startX, startY, width, height);
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
  } else if (currentTool === "diamond") {
    ctx.beginPath();
    ctx.moveTo(startX, startY - (y - startY));
    ctx.lineTo(x, startY);
    ctx.lineTo(startX, startY + (y - startY));
    ctx.lineTo(startX - (x - startX), startY);
    ctx.closePath();
    ctx.stroke();
  }

  // Restaura la opacidad y el estilo de trazo a los valores por defecto
  ctx.globalAlpha = 1.0;
  ctx.setLineDash([]);
});
