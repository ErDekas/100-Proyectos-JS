document.addEventListener("DOMContentLoaded", function() {
    // Imágenes para cada categoría
    const normalesImages = ["imagen1.jpg", "imagen2.jpg", "imagen3.jpg"];
    const instagramImages = ["imagen4.jpg", "imagen5.jpg", "imagen6.jpg"];
    const snapchatImages = ["imagen7.jpg", "imagen8.jpg", "imagen9.jpg"];

    // Función para cargar las imágenes en una categoría específica
    function cargarImagenes(categoria, imagenes) {
        const container = document.getElementById(categoria);
        imagenes.forEach(function(imagen) {
            const img = document.createElement("img");
            img.src = "images/" + categoria.toLowerCase() + "/" + imagen;
            container.appendChild(img);
        });
    }

    // Cargar las imágenes en cada categoría
    cargarImagenes("normales", normalesImages);
    cargarImagenes("instagram", instagramImages);
    cargarImagenes("snapchat", snapchatImages);
});
