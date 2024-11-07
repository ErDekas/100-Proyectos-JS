// Seleccionamos los elementos necesarios
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeButton = document.querySelector('.close');

// Mostramos el lightbox
galleryItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const imgSrc = item.querySelector('img').src;
        lightboxImg.src = imgSrc;
        lightbox.style.display = 'flex'; // Mostrar el lightbox
    });
});

// Cerrar el lightbox
closeButton.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

// Cerrar el lightbox si se hace clic fuera de la imagen
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
    }
});
