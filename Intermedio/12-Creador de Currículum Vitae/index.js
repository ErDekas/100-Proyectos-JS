function actualizarVistaPrevia() {
    document.getElementById("cv-nombre").innerText = document.getElementById("nombre").value + ' ' + document.getElementById("apellido").value;
    document.getElementById("cv-puesto").innerText = document.getElementById("puesto").value;
    document.getElementById("cv-contacto").innerHTML = `
        <strong>Email:</strong> ${document.getElementById("email").value} <br>
        <strong>Teléfono:</strong> ${document.getElementById("telefono").value} <br>
        <strong>Dirección:</strong> ${document.getElementById("direccion").value}, ${document.getElementById("ciudad").value} ${document.getElementById("codigoPostal").value}`;

    // Extras
    document.getElementById("cv-pasatiempos").innerText = document.getElementById("pasatiempos").value;
    document.getElementById("cv-idiomas").innerText = document.getElementById("idiomas").value;
}

function mostrarImagen(event) {
    const output = document.getElementById("cv-foto");
    output.style.backgroundImage = `url(${URL.createObjectURL(event.target.files[0])})`;
    output.style.backgroundSize = "cover";
}

// Agregar experiencia laboral
function agregarExperiencia() {
    const puesto = document.getElementById("puestoExp").value;
    const compania = document.getElementById("companiaExp").value;
    const ubicacion = document.getElementById("ubicacionExp").value;
    const inicio = document.getElementById("inicioExp").value;
    const fin = document.getElementById("finExp").value;

    if (puesto && compania) {
        const experiencia = `<p><strong>${puesto}</strong> en ${compania}, ${ubicacion} (${inicio} - ${fin})</p>`;
        document.getElementById("cv-experiencia").innerHTML += experiencia;

        // Limpiar los campos
        document.getElementById("puestoExp").value = '';
        document.getElementById("companiaExp").value = '';
        document.getElementById("ubicacionExp").value = '';
        document.getElementById("inicioExp").value = '';
        document.getElementById("finExp").value = '';
    }
}

// Agregar habilidad
function agregarHabilidad() {
    const nombreHabilidad = document.getElementById("nombreHabilidad").value;
    const nivelHabilidad = document.getElementById("nivelHabilidad").value;

    if (nombreHabilidad) {
        const habilidad = `<p>${nombreHabilidad} - Nivel: ${nivelHabilidad}</p>`;
        document.getElementById("cv-habilidades").innerHTML += habilidad;

        // Limpiar los campos
        document.getElementById("nombreHabilidad").value = '';
        document.getElementById("nivelHabilidad").value = 5; // Restablecer a nivel medio
    }
}

// Agregar educación
function agregarEducacion() {
    const institucion = document.getElementById("institucion").value;
    const grado = document.getElementById("grado").value;
    const ubicacion = document.getElementById("ubicacionEdu").value;
    const inicio = document.getElementById("inicioEdu").value;
    const fin = document.getElementById("finEdu").value;

    if (institucion && grado) {
        const educacion = `<p><strong>${grado}</strong> en ${institucion}, ${ubicacion} (${inicio} - ${fin})</p>`;
        document.getElementById("cv-educacion").innerHTML += educacion;

        // Limpiar los campos
        document.getElementById("institucion").value = '';
        document.getElementById("grado").value = '';
        document.getElementById("ubicacionEdu").value = '';
        document.getElementById("inicioEdu").value = '';
        document.getElementById("finEdu").value = '';
    }
}
function generarPDF() {
    const { jsPDF } = window.jspdf;

    // Selecciona el contenedor de vista previa del CV
    const cvElement = document.getElementById('vista-previa');

    // Usa html2canvas para convertir el CV en una imagen
    html2canvas(cvElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        // Crear un nuevo documento PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Ajustar la imagen al tamaño de la página del PDF
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Añadir la imagen al PDF
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Descargar el archivo PDF
        pdf.save('curriculum-vitae.pdf');
    });
}
