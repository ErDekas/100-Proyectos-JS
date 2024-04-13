function borrarUltimoCaracter(){
    let mostrar = document.getElementById('mostrar');
    let valorActual  = mostrar.value;
    if(valorActual.length > 0){
        mostrar.value = valorActual.slice(0,-1);
    }
}
function agregarCaracter(caracter){
    let mostrar = document.getElementById('mostrar');
    mostrar.value += caracter;
}
function realizarCalculo(operador){
    let mostrar = document.getElementById('mostrar');
    try{
        if(operador === '='){
            mostrar.value = eval(mostrar.value);
        }else{
            mostrar.value += operador;
        }
    }catch  (error){
        mostrar.value = 'Error';
    }
}
function resetearDiv(){
    let mostrar = document.getElementById('mostrar');
    mostrar.value = '';
}
function realizarPorcentaje(operador){
    let mostrar = document.getElementById('mostrar');
    if(!isNaN(mostrar.value)){
        mostrar.value = parseFloat(mostrar.value) / 100;
    }
}