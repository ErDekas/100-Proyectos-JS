const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const currentPageElem = document.getElementById('current-page');
const totalPagesElem = document.getElementById('total-pages');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const fullscreenBtn = document.getElementById('fullscreen-toggle');
const exitFullscreenBtn = document.getElementById('exit-fullscreen');
const goToPageInput = document.getElementById('go-to-page');

let pdfDoc = null;
let currentPage = 1;
let isFullscreen = false;

// Función para entrar en modo pantalla completa
function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
}

// Función para salir de modo pantalla completa
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

// Función para cambiar entre pantalla completa y normal
function toggleFullscreenMode() {
    if (!isFullscreen) {
        enterFullscreen();
        fullscreenBtn.style.display = 'none'; // Ocultar el botón de pantalla completa
    } else {
        exitFullscreen();
        fullscreenBtn.style.display = 'block'; // Mostrar el botón de pantalla completa
    }
    isFullscreen = !isFullscreen;
}

// Cambiar la visibilidad de los controles y mostrar el botón para salir de pantalla completa
document.addEventListener('fullscreenchange', function () {
    if (document.fullscreenElement) {
        document.body.classList.add('fullscreen');
        exitFullscreenBtn.style.display = 'block';
    } else {
        document.body.classList.remove('fullscreen');
        exitFullscreenBtn.style.display = 'none';
    }
});

// Cargar y renderizar el PDF
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const pdfData = new Uint8Array(this.result);
            pdfjsLib.getDocument(pdfData).promise.then((pdf) => {
                pdfDoc = pdf;
                totalPagesElem.textContent = pdf.numPages;
                renderPage(currentPage);
                updatePageControls();
            });
        };
        fileReader.readAsArrayBuffer(file);
    } else {
        alert('Por favor, selecciona un archivo PDF.');
    }
});

// Función para renderizar la página
function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: isFullscreen ? 1.5 : 1 }); // Ajustar escala
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({ canvasContext: ctx, viewport: viewport });
        currentPageElem.textContent = pageNum;
    });
}

// Actualizar los controles de navegación
function updatePageControls() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === pdfDoc.numPages;
}

// Navegar a la página anterior
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        updatePageControls();
    }
});

// Navegar a la página siguiente
nextPageBtn.addEventListener('click', () => {
    if (currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
        updatePageControls();
    }
});

// Activar/desactivar el modo pantalla completa
fullscreenBtn.addEventListener('click', toggleFullscreenMode);
exitFullscreenBtn.addEventListener('click', () => {
    exitFullscreen();
    fullscreenBtn.style.display = 'block';
    isFullscreen = false;
});

// Ir a una página específica con el input
goToPageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const pageNumber = parseInt(goToPageInput.value);
        if (pageNumber > 0 && pageNumber <= pdfDoc.numPages) {
            currentPage = pageNumber;
            renderPage(currentPage);
            updatePageControls();
        } else {
            alert('Número de página no válido');
        }
    }
});

// Movimiento con las flechas del teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        if (currentPage < pdfDoc.numPages) {
            currentPage++;
            renderPage(currentPage);
            updatePageControls();
        }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
            updatePageControls();
        }
    } else if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
        fullscreenBtn.style.display = 'block';
        isFullscreen = false;
    } else if (event.key === 'Enter') {
        enterFullscreen();
        fullscreenBtn.style.display = 'none';
        isFullscreen = true;
    }
});