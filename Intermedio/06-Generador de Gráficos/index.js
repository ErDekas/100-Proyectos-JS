let myChart; // Variable global para almacenar la instancia del gráfico

const createInputs = () => {
    const numDatos = document.getElementById('numDatos').value;
    const dataInputs = document.getElementById('dataInputs');
    dataInputs.innerHTML = ''; // Limpiar entradas previas

    for (let i = 0; i < numDatos; i++) {
        dataInputs.innerHTML += `
            <div>
                <label for="name${i}">Nombre ${i + 1}:</label>
                <input type="text" id="name${i}" required>
                <label for="value${i}">Valor ${i + 1}:</label>
                <input type="number" id="value${i}" min="0" required>
                <label for="color${i}">Color ${i + 1}:</label>
                <input type="color" id="color${i}" value="#36a2eb">
            </div>
        `;
    }
};

const generateChart = (event) => {
    event.preventDefault(); // Evitar que se recargue la página

    const numDatos = document.getElementById('numDatos').value;
    const labels = [];
    const data = [];
    const backgroundColors = []; // Array para almacenar los colores

    for (let i = 0; i < numDatos; i++) {
        labels.push(document.getElementById(`name${i}`).value);
        data.push(document.getElementById(`value${i}`).value);
        backgroundColors.push(document.getElementById(`color${i}`).value); // Obtener color
    }

    const chartType = document.getElementById('chartType').value;

    const ctx = document.getElementById('myChart').getContext('2d');

    // Verificar si ya existe un gráfico y destruirlo
    if (myChart) {
        myChart.destroy();
    }

    // Crear nuevo gráfico
    myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Datos del Gráfico',
                data: data,
                backgroundColor: backgroundColors, // Usar colores personalizados
                borderColor: backgroundColors.map(color => color), // Usar el mismo color para la línea
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

// Asignar el evento al formulario
document.getElementById('dataForm').addEventListener('submit', generateChart);
