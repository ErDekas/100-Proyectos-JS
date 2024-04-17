// Cantidades a convertir
const cantidadMasa = document.getElementById('cantidadMasa');
const cantidadLongitud = document.getElementById('cantidadLongitud');
const cantidadTemperatura = document.getElementById('cantidadTemperatura');
// Resultados de la conversión
const resultadoMasa = document.getElementById('resultadoMasa');
const resultadoLongitud = document.getElementById('resultadoLongitud');
const resultadoTemperatura = document.getElementById('resultadoTemperatura');
// Unidades disponibles a elegir como base
const masaOriginal = document.getElementById('masaOriginal');
const longitudOriginal = document.getElementById('longitudOriginal');
const temperaturaOriginal = document.getElementById('temperaturaOriginal');
// Unidades disponibles a convertir
const masaNueva = document.getElementById('masaNueva');
const longitudNueva = document.getElementById('longitudNueva');
const temperaturaNueva = document.getElementById('temperaturaNueva');

let conversionesMasa = {
    'kilogramo':{
        'tonelada': 0.001,
        'hectogramo': 10,
        'decagramo': 100,
        'gramo': 1000,
        'decigramo': 10000,
        'centigramo': 100000,
        'miligramo': 1000000
    },
    'tonelada':{
        'kilogramo': 1000,
        'hectogramo': 10000,
        'decagramo': 100000,
        'gramo': 1000000,
        'decigramo': 10000000,
        'centigramo': 100000000,
        'miligramo': 1000000000
    },
    'hectogramo':{
        'kilogramo': 0.1,
        'tonelada': 0.0001,
        'decagramo': 10,
        'gramo': 100,
        'decigramo': 1000,
        'centigramo': 10000,
        'miligramo': 100000
    },
    'decagramo':{
        'kilogramo': 0.01,
        'tonelada': 0.00001,
        'hectogramo': 0.1,
        'gramo': 10,
        'decigramo': 100,
        'centigramo': 1000,
        'miligramo': 10000
    },
    'gramo':{
        'kilogramo': 0.001,
        'tonelada': 0.000001,
        'hectogramo': 0.01,
        'decagramo': 0.1,
        'decigramo': 10,
        'centigramo': 100,
        'miligramo': 1000
    },
    'decigramo':{
        'kilogramo': 0.0001,
        'tonelada': 0.0000001,
        'hectogramo': 0.0001,
        'decagramo': 0.01,
        'gramo': 0.1,
        'centigramo': 10,
        'miligramo': 100
    },
    'centigramo':{
        'kilogramo': 0.00001,
        'tonelada': 0.00000001,
        'hectogramo': 0.00001,
        'decagramo': 0.0001,
        'gramo': 0.01,
        'decigramo': 0.1,
        'miligramo': 10
    },
    'miligramo':{
        'kilogramo': 0.000001,
        'tonelada': 0.000000001,
        'hectogramo': 0.000001,
        'decagramo': 0.00001,
        'gramo': 0.0001,
        'decigramo': 0.0001,
        'centigramo': 0.01
    }
};
let conversionesLongitud = {
    'kilometro':{
        'hectometro': 10,
        'decametro': 100,
        'metro': 1000,
        'decimetro':10000,
        'centimetro': 100000,
        'milimetro': 1000000
    },
    'hectometro':{
        'kilometro': 0.1,
        'decametro': 10,
        'metro': 100,
        'decimetro':1000,
        'centimetro': 10000,
        'milimetro': 100000
    },
    'decametro':{
        'kilometro': 0.01,
        'hectometro': 0.1,
        'metro': 10,
        'decimetro': 100,
        'centimetro': 1000,
        'milimetro': 10000
    },
    'metro':{
        'kilometro': 0.001,
        'hectometro': 0.01,
        'decametro': 0.1,
        'decimetro': 10,
        'centimetro': 100,
        'milimetro': 1000
    },
    'decimetro':{
        'kilometro': 0.0001,
        'hectometro': 0.001,
        'decametro': 0.01,
        'metro': 0.1,
        'centimetro': 10,
        'milimetro': 100
    },
    'centimetro':{
        'kilometro': 0.00001,
        'hectometro': 0.0001,
        'decametro': 0.001,
        'metro': 0.01,
        'decimetro': 0.1,
        'milimetro': 10
    },
    'milimetro':{
        'kilometro': 0.000001,
        'hectometro': 0.00001,
        'decametro': 0.0001,
        'metro': 0.001,
        'decimetro': 0.01,
        'centimetro': 0.1
    }
};
let conversionesTemperatura = {
    'celsius':{
        'fahrenheit': 34,
        'kelvin': 274
    },
    'fahrenheit':{
        'celsius': -17,
        'kelvin': 256
    },
    'kelvin':{
        'celsius': -272,
        'fahrenheit': -458
    }
};
