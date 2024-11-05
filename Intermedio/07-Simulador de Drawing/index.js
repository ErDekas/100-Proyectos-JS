const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 60; // Ajustar para la barra de herramientas

let painting = false;
let erasing = false;
let addingText = false; // Estado para añadir texto
let color = document.getElementById('colorPicker').value;
let brushSize = parseInt(document.getElementById('brushSize').value);
let textPosition = { x: 0, y: 0 };

// Comenzar a dibujar o borrar
canvas.addEventListener('mousedown', (e) => {
    if (!addingText) { // Solo dibuja o borra si no está en modo de añadir texto
        painting = true;
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
});

// Dibujo y borrado siguiendo al ratón
canvas.addEventListener('mousemove', (e) => {
    if (painting) {
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;

        if (erasing) {
            ctx.globalCompositeOperation = 'destination-out'; // Modo de borrado
            ctx.lineWidth = brushSize;
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            ctx.globalCompositeOperation = 'source-over'; // Modo normal
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
});

// Terminar de dibujar o borrar
canvas.addEventListener('mouseup', () => {
    painting = false;
    ctx.closePath();
});

// Alternar entre goma y lápiz
document.getElementById('eraseBtn').addEventListener('click', () => {
    erasing = !erasing;
    addingText = false; // Desactivar el modo de texto
    document.getElementById('eraseBtn').innerText = erasing ? "Dibujo" : "Goma";
});

// Cambiar color
document.getElementById('colorPicker').addEventListener('input', (e) => {
    color = e.target.value;
});

// Cambiar tamaño del lápiz/goma
document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
});

// Iniciar modo de añadir texto
document.getElementById('textBtn').addEventListener('click', () => {
    addingText = true;
    erasing = false; // Desactivar goma si está activa
    document.getElementById('eraseBtn').innerText = "Goma";
});

// Seleccionar posición de texto en el lienzo
canvas.addEventListener('click', (e) => {
    if (addingText) {
        // Obtener la posición del clic en el lienzo
        textPosition.x = e.clientX - canvas.offsetLeft;
        textPosition.y = e.clientY - canvas.offsetTop;
        
        // Mostrar el cuadro de entrada de texto flotante en la posición seleccionada
        const textInput = document.getElementById('textInput');
        textInput.style.position = 'absolute';
        textInput.style.left = `${e.clientX}px`;
        textInput.style.top = `${e.clientY}px`;
        textInput.style.display = 'inline';
        textInput.focus(); // Enfocar para que el usuario pueda escribir directamente
    }
});

// Colocar texto en el lienzo al presionar Enter
document.getElementById('textInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { // Si se presiona Enter
        const text = e.target.value;
        if (text) {
            // Dibujar el texto en el lienzo en la posición seleccionada
            ctx.fillStyle = color; // Usar el color seleccionado
            ctx.font = '20px Arial'; // Cambiar la fuente y tamaño si es necesario
            ctx.fillText(text, textPosition.x, textPosition.y); // Colocar el texto en la posición seleccionada
        }
        e.target.value = ''; // Limpiar el input de texto
        e.target.style.display = 'none'; // Ocultar el cuadro de texto flotante
        addingText = false; // Salir del modo de añadir texto
    }
});
