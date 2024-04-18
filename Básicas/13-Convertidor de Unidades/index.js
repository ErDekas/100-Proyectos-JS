function convertirMasa(){
    let cantidad = parseFloat(document.getElementById('cantidadMasa').value)
    let masaOriginal = document.getElementById('masaOriginal').value;
    let masaNueva = document.getElementById('masaNueva').value;

    var resultado = 0;

    let gramos = 0;
    switch (masaOriginal) {
        case "Toneladas (t)":
            gramos = cantidad * 1000000; // 1 tonelada = 1000000 gramos
            break;
        case "Kilogramo (kg)":
            gramos = cantidad * 1000; // 1 kilogramo = 1000 gramos
            break;
        case "Hectogramo (hg)":
            gramos = cantidad * 100; // 1 hectogramo = 100 gramos
            break;
        case "Decagramo (dag)":
            gramos = cantidad * 10; // 1 decagramo = 10 gramos
            break;
        case "Gramo (g)":
            gramos = cantidad;
            break;
        case "Decigramo (dg)":
            gramos = cantidad / 10; // 1 decigramo = 0.1 gramos
            break;
        case "Centigramo (cg)":
            gramos = cantidad / 100; // 1 centigramo = 0.01 gramos
            break;
        case "Miligramo (mg)":
            gramos = cantidad / 1000; // 1 miligramo = 0.001 gramos
            break;
        default:
            break;
    }

    switch (masaNueva) {
        case "Toneladas (t)":
            resultado = gramos / 1000000;
            break;
        case "Kilogramo (kg)":
            resultado = gramos / 1000;
            break;
        case "Hectogramo (hg)":
            resultado = gramos / 100;
            break;
        case "Decagramo (dag)":
            resultado = gramos / 10;
            break;
        case "Gramo (g)":
            resultado = gramos;
            break;
        case "Decigramo (dg)":
            resultado = gramos * 10;
            break;
        case "Centigramo (cg)":
            resultado = gramos * 100;
            break;
        case "Miligramo (mg)":
            resultado = gramos * 1000;
            break;
        default:
            break;
    }

    document.getElementById('resultadoMasa').innerText = resultado;
}
function convertirLongitud(){
    let cantidad = parseFloat(document.getElementById('cantidadLongitud').value);
    let longitudOriginal = document.getElementById('longitudOriginal').value;
    let longitudNueva = document.getElementById('longitudNueva').value;
    var resultado = 0;

    let metros = 0;
    switch (longitudOriginal) {
        case "Kilómetro (km)":
            metros = cantidad * 1000; // 1 kilómetro = 1000 metros
            break;
        case "Hectómetro (hm)":
            metros = cantidad * 100; // 1 hectómetro = 100 metros
            break;
        case "Decámetro (dam)":
            metros = cantidad * 10; // 1 decámetro = 10 metros
            break;
        case "Metro (m)":
            metros = cantidad;
            break;
        case "Decimetro (dm)":
            metros = cantidad / 10; // 1 decímetro = 0.1 metros
            break;
        case "Centimetro (cm)":
            metros = cantidad / 100; // 1 centímetro = 0.01 metros
            break;
        case "Milimetro (mm)":
            metros = cantidad / 1000; // 1 milímetro = 0.001 metros
            break;
        default:
            break;
    }
    switch (longitudNueva) {
        case "Kilómetro (km)":
            resultado = metros / 1000;
            break;
        case "Hectómetro (hm)":
            resultado = metros / 100;
            break;
        case "Decámetro (dam)":
            resultado = metros / 10;
            break;
        case "Metro (m)":
            resultado = metros;
            break;
        case "Decimetro (dm)":
            resultado = metros * 10;
            break;
        case "Centimetro (cm)":
            resultado = metros * 100;
            break;
        case "Milimetro (mm)":
            resultado = metros * 1000;
            break;
        default:
            break;
    }
    document.getElementById('resultadoLongitud').innerText = resultado;
}
function convertirTemperatura(){
    let cantidad = parseFloat(document.getElementById('cantidadTemperatura').value);
    let temperaturaOriginal = document.getElementById('temperaturaOriginal').value;
    let temperaturaNueva = document.getElementById('temperaturaNueva').value;
    var resultado = 0;

    if (temperaturaOriginal === temperaturaNueva) {
        resultado = cantidad; // Si las unidades son las mismas, el resultado es igual a la cantidad original
    } else if (temperaturaOriginal === "Centígrados (°C)") {
        if (temperaturaNueva === "Fahrenheit (°F)") {
            resultado = (cantidad * 9 / 5) + 32; // Fórmula de conversión de Celsius a Fahrenheit
        } else if (temperaturaNueva === "Kelvin (K)") {
            resultado = cantidad + 273.15; // Fórmula de conversión de Celsius a Kelvin
        }
    } else if (temperaturaOriginal === "Fahrenheit (°F)") {
        if (temperaturaNueva === "Centígrados (°C)") {
            resultado = (cantidad - 32) * 5 / 9; // Fórmula de conversión de Fahrenheit a Celsius
        } else if (temperaturaNueva === "Kelvin (K)") {
            resultado = (cantidad - 32) * 5 / 9 + 273.15; // Fórmula de conversión de Fahrenheit a Kelvin
        }
    } else if (temperaturaOriginal === "Kelvin (K)") {
        if (temperaturaNueva === "Centígrados (°C)") {
            resultado = cantidad - 273.15; // Fórmula de conversión de Kelvin a Celsius
        } else if (temperaturaNueva === "Fahrenheit (°F)") {
            resultado = (cantidad - 273.15) * 9 / 5 + 32; // Fórmula de conversión de Kelvin a Fahrenheit
        }
    }

    document.getElementById('resultadoTemperatura').innerText = resultado;
}