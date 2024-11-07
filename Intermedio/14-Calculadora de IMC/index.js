document.getElementById('imc-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar que el formulario se envíe

    // Obtener los valores de peso y altura
    let peso = parseFloat(document.getElementById('peso').value);
    let altura = parseFloat(document.getElementById('altura').value);

    // Validar que los valores sean válidos
    if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
        alert("Por favor ingrese valores válidos para el peso y la altura.");
        return;
    }

    // Convertir la altura de centímetros a metros
    altura = altura / 100;

    // Calcular el IMC
    let imc = peso / (altura * altura);

    // Mostrar el valor del IMC
    document.getElementById('imc').textContent = `IMC: ${imc.toFixed(2)}`;

    // Determinar la clasificación del IMC
    let clasificacion = '';
    if (imc < 18.5) {
        clasificacion = 'Bajo peso';
    } else if (imc >= 18.5 && imc <= 24.9) {
        clasificacion = 'Normal';
    } else if (imc >= 25 && imc <= 29.9) {
        clasificacion = 'Sobrepeso';
    } else if (imc >= 30 && imc <= 34.9) {
        clasificacion = 'Obesidad grado I';
    } else if (imc >= 35 && imc <= 39.9) {
        clasificacion = 'Obesidad grado II';
    } else {
        clasificacion = 'Obesidad grado III';
    }

    // Mostrar la clasificación
    document.getElementById('clasificacion').textContent = `Clasificación: ${clasificacion}`;
});
