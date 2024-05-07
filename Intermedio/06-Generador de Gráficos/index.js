const canvas = document.getElementById('grafico');
const ctx = canvas.getContext('2d');

function dibujarGrafico(datos) {
    const anchoBarra = 50;
    const espacioEntreBarras = 20;
    const colorBarra = 'blue';
    let x = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    datos.forEach(dato => {
        const alturaBarra = dato * 5;
        ctx.fillStyle = colorBarra;
        ctx.fillRect(x, canvas.height - alturaBarra, anchoBarra, alturaBarra);
        x += anchoBarra + espacioEntreBarras;
    });
}

document.getElementById('formDatos').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe

    const datosInput = document.getElementById('datos').value;
    const datos = datosInput.split(',').map(valor => parseInt(valor.trim(), 10));

    if (datos.some(isNaN)) {
        alert('Por favor, introduce valores numéricos separados por comas.');
        return;
    }

    dibujarGrafico(datos);
});
