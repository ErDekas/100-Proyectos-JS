/**
 * Function to copy the content of an element to the clipboard.
 *
 */
function copyToClipBoard(){
    let content = document.getElementById('contrasena');

    content.select();
    document.execCommand('copy');
}
let letras =['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
let numeros = ['1','2','3','4','5','6','7','8','9','0'];
let simbolos = ['~','`','!','@','#','$','%','^','&','*','(',')','-','_','+','=','{','[','}',']','|',':',';','"','<','>','?','/','\\'];
/**
 * Generates a password based on the selected options.
 *
 * @return {undefined}
 */
function generarContrasena(){
    let contrasena = document.getElementById('contrasena');
    let letras = document.getElementById('letras').checked;
    let simbolos = document.getElementById('simbolos').checked;
    let numeros = document.getElementById('numeros').checked;
    let longitud = document.getElementById('longitud').value;

    if((letras || simbolos || numeros)==true){
        contrasena.value = generarPassword(letras, simbolos, numeros, longitud);
    }else{
        alert('Debes seleccionar al menos una opción');
    }
}
