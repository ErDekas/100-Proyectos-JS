let imagenes = [
    { imagen: "img/img1.jpg"},
    { imagen: "img/img2.jpg"},
    { imagen: "img/img3.jpg"},
    { imagen: "img/img4.jpg"},
    { imagen: "img/img5.jpg"}
]

const body = document.body;

const imagenContainer = document.getElementById('imagenContainer');

let currentIndex = 0;

function displayImagenContainer(){
    const currentImagen = imagenes[currentIndex];
    imagenContainer.innerHTML = `<img src="${currentImagen.imagen}">`;
}

function nextImagen(){
    currentIndex = (currentIndex + 1) % imagenes.length;
    displayImagenContainer();
}

function prevImagen(){
    currentIndex = (currentIndex - 1 + imagenes.length) % imagenes.length;
    displayImagenContainer();
}

let intervalID;

function startInterval(){
<<<<<<< HEAD
    intervalID = setInterval(nextImagen, 3000);
=======
    intervalID = setInterval(nextOpinion, 3000);
>>>>>>> refs/remotes/origin/main
}

function stopInterval(){
    clearInterval(intervalID);
}

<<<<<<< HEAD
document.getElementById('retroceso').addEventListener('mouseenter', stopInterval);
document.getElementById('adelante').addEventListener('mouseenter', stopInterval);

document.getElementById('retroceso').addEventListener('mouseleave', startInterval);
document.getElementById('adelante').addEventListener('mouseleave', startInterval);

document.getElementById('imagenContainer').addEventListener('mouseenter', stopInterval);
document.getElementById('imagenContainer').addEventListener('mouseleave', startInterval);

displayImagenContainer();
=======
>>>>>>> refs/remotes/origin/main
startInterval();