const nombre = document.getElementById("name");
const apellidos = document.getElementById("apellidos");
const telefono = document.getElementById("telefono");
const DNI = document.getElementById("DNI");
const email = document.getElementById("email");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const Rpassword = document.getElementById("Rpassword");
const form = document.getElementById("form");
const parrafo = document.getElementById("warnings");

form.addEventListener("submit", e => {
    e.preventDefault();
    
    let warnings = "";
    let entrar = false;

    // Expresiones regulares
    const regexNombre = /^[a-zA-ZÀ-ÿ\s]{2,30}$/;  // Solo letras y espacios, entre 2 y 30 caracteres
    const regexApellido = /^[a-zA-ZÀ-ÿ\s]{2,30}$/;  // Solo letras y espacios, entre 2 y 30 caracteres
    const regexTelefono = /^\d{9,15}$/;  // Entre 9 y 15 dígitos
    const regexDNI = /^\d{8}[A-Z]$/;  // 8 dígitos seguidos de una letra mayúscula
    const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/;  // Email estándar
    
    // Validación de cada campo

    if (!regexNombre.test(nombre.value)) {
        warnings += `El nombre no es válido, debe tener entre 2 y 30 caracteres y solo letras.<br>`;
        entrar = true;
    }

    if (!regexApellido.test(apellidos.value)) {
        warnings += `Los apellidos no son válidos, deben tener entre 2 y 30 caracteres y solo letras.<br>`;
        entrar = true;
    }

    if (!regexTelefono.test(telefono.value)) {
        warnings += `El teléfono no es válido, debe tener entre 9 y 15 dígitos.<br>`;
        entrar = true;
    }

    if (!regexDNI.test(DNI.value)) {
        warnings += `El DNI no es válido, debe tener 8 dígitos seguidos de una letra mayúscula.<br>`;
        entrar = true;
    }

    if (!regexEmail.test(email.value)) {
        warnings += `El email no es válido.<br>`;
        entrar = true;
    }

    if (usuario.value.length < 4) {
        warnings += `El usuario debe tener al menos 4 caracteres.<br>`;
        entrar = true;
    }

    if (password.value.length < 8) {
        warnings += `La contraseña debe tener al menos 8 caracteres.<br>`;
        entrar = true;
    }

    if (password.value !== Rpassword.value) {
        warnings += `Las contraseñas no coinciden.<br>`;
        entrar = true;
    }

    // Mostrar advertencias o mensaje de éxito
    if (entrar) {
        parrafo.innerHTML = warnings;
    } else {
        parrafo.innerHTML = "Formulario enviado exitosamente";
        form.reset();  // Reinicia el formulario después de enviar
    }
});
