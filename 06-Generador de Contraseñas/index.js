/**
 * Function to copy the content of an element to the clipboard.
 *
 */
function copyToClipBoard(){
    let copyText = document.getElementById("contrasena");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
  
     // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);
}
/**
 * Generates a new random password based on user-selected options and updates the password input field.
 *
 * @param {none}
 * @return {void}
 */
function regenerarContrasena() {
    // Obtener las opciones seleccionadas por el usuario
    let usarLetras = document.getElementById("letras").checked;
    let usarNumeros = document.getElementById("numeros").checked;
    let usarSimbolos = document.getElementById("simbolos").checked;
    let longitud = document.getElementById("slider").value;

    // Definir los caracteres disponibles según las opciones seleccionadas
    let caracteres = '';
    if (usarLetras) caracteres += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (usarNumeros) caracteres += '0123456789';
    if (usarSimbolos) caracteres += '!@#$%&*()_+{}|[];\',./<>?:';

    // Generar una nueva contraseña aleatoria
    let nuevaContrasena = '';
    for (let i = 0; i < longitud; i++) {
        nuevaContrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // Actualizar el valor del campo de entrada de texto con la nueva contraseña
    document.getElementById("contrasena").value = nuevaContrasena;
}


