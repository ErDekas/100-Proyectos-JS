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
let contrasena = [];
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

    recorrerArrays(letras, simbolos, numeros);
    }
    
console.log(letras.length);
console.log(numeros.length);
console.log(simbolos.length);
let suma = letras.length+numeros.length+simbolos.length;
console.log(suma);

function recorrerArrays(letras, simbolos, numeros) {
    if (letras == checked) {
        letras.forEach(function (element, indice, _array) {
            console.log(element, indice);
        });

    }
    if (simbolos == checked) {
        simbolos.forEach(function (element, indice, _array) {
            console.log(element, indice);
        });
    }
    if (numeros == checked) {
        simbolos.forEach(function (element, indice, _array) {
            console.log(element, indice);
        });
    }
}
