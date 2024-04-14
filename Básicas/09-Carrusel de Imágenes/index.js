let imagenes = [
    { imagen: "img1.jpg"},
    { imagen: "img2.jpg"},
    { imagen: "img3.jpg"},
    { imagen: "img4.jpg"},
    { imagen: "img5.jpg"}
]

const carrusel = document.getElementById('carrusel');

let currentIndex = 0;

function displayCurrentOpinion(){
    const currentOpinion = imagenes[currentIndex];
    carrusel.innerHTML = `<img src="${currentOpinion.imagen}" alt="Imagen ${currentIndex + 1}">`;
}

function nextOpinion(){
    currentIndex = (currentIndex + 1) % imagenes.length;
    displayCurrentOpinion();
}

function prevOpinon(){
    currentIndex = (currentIndex - 1 + imagenes.length) % imagenes.length;
    displayCurrentOpinion();
}

let intervalID;

function startInterval(){
    intervalID = setInterval(nextOpinion, 3000);
}

function stopInterval(){
    clearInterval(intervalID);
}

startInterval();