// script.js
document.getElementById("convertBtn").addEventListener("click", function () {
    // Obtener el valor de entrada y la unidad seleccionada
    let inputValue = parseFloat(document.getElementById("inputValue").value);
    let inputUnit = document.getElementById("inputUnit").value;

    // Verificar si el valor de entrada es un número válido
    if (isNaN(inputValue) || inputValue <= 0) {
        alert("Por favor, introduce un valor válido mayor a 0.");
        return;
    }

    // Realizar las conversiones dependiendo de la unidad de entrada
    let segundos, minutos, horas, dias;

    switch (inputUnit) {
        case "segundos":
            segundos = inputValue;
            minutos = segundos / 60;
            horas = minutos / 60;
            dias = horas / 24;
            break;
        case "minutos":
            segundos = inputValue * 60;
            minutos = inputValue;
            horas = minutos / 60;
            dias = horas / 24;
            break;
        case "horas":
            segundos = inputValue * 3600;
            minutos = inputValue * 60;
            horas = inputValue;
            dias = horas / 24;
            break;
        case "dias":
            segundos = inputValue * 86400;
            minutos = inputValue * 1440;
            horas = inputValue * 24;
            dias = inputValue;
            break;
    }

    // Mostrar los resultados
    let output = `
        <strong>${inputValue} ${inputUnit}</strong> equivale a:<br>
        <strong>${segundos.toFixed(2)}</strong> segundos<br>
        <strong>${minutos.toFixed(2)}</strong> minutos<br>
        <strong>${horas.toFixed(2)}</strong> horas<br>
        <strong>${dias.toFixed(2)}</strong> días
    `;

    document.getElementById("output").innerHTML = output;
});
