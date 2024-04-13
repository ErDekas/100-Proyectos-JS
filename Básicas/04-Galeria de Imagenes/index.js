const gallery = document.querySelector('.gallery');

gallery.addEventListener('click', (e) => {
    if(e.target.tagName === 'IMG'){
        console.log(`Has hecho click en la imagen con alt: ${e.target.alt}`);
    }
})