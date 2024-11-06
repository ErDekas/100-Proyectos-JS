document.getElementById('generarCV').addEventListener('click', function(){
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const experiencia = document.getElementById('experiencia').value;
    const educacion = document.getElementById('educacion').value;
    const habilidades = document.getElementById('habilidades').value;

    let contenidoCV = `
        <h3>Nombre: ${nombre}</h3>
        <p><strong>Email:</strong>${email}</p>
        <p><strong>Teléfono:</strong>${telefono}</p>
        <p><strong>Dirección:</strong>${direccion}</p>

        <h3>Experiencia Laboral</h3>
        <p>${experiencia}</p>

        <h3>Educación</h3>
        <p>${educacion}</p>

        <h3>Habilidades</h3>
        <p>${habilidades}</p>
    `;

    document.getElementById('cv-contenido').innerHTML = contenidoCV;
});