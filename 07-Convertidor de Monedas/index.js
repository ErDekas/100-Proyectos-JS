document.addEventListener('DOMContentLoaded', function() {
    const botonResultado = document.getElementById('resultado');

    botonResultado.addEventListener('click', function() {
        const moneda1 = document.getElementById('moneda1').value;
        const moneda2 = document.getElementById('moneda2').value;
        const cantidad = parseFloat(document.getElementById('cantidad').value);

        convertirMoneda(moneda1, moneda2, cantidad)
            .then(resultado => {
                botonResultado.value = `Resultado: ${resultado.toFixed(2)} ${moneda2}`;
            })
            .catch(error => {
                console.error('Error al convertir moneda:', error);
            });
    });
});

async function getExchangeRates() {
    const apiKey = '00a5f4a4e3d24872afa77645df91d6e5';
    const baseCurrency = 'USD';
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}?apikey=${apiKey}`);
    const data = await response.json();
    return data.rates;
}

async function convertirMoneda(monedaOrigen, monedaDestino, cantidad) {
    try {
        const rates = await getExchangeRates();
        
        const tasa = rates[monedaDestino] / rates[monedaOrigen];

        const resultado = cantidad * tasa;

        return resultado;
    } catch (error) {
        throw new Error('Error al obtener las tasas de cambio de moneda');
    }
}
