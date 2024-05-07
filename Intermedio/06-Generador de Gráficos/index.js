document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('chartForm');
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Obtener el tipo de gráfico seleccionado por el usuario
      const chartType = document.getElementById('chartType').value;
  
      // Generar datos y opciones del gráfico
      const data = {
        labels: ['A', 'B', 'C', 'D', 'E'],
        datasets: [{
          label: 'Ejemplo de Datos',
          data: [12, 19, 3, 5, 2],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      };
  
      const options = {
        responsive: true,
        maintainAspectRatio: false
      };
  
      // Crear el gráfico
      const ctx = document.getElementById('myChart').getContext('2d');
      const myChart = new Chart(ctx, {
        type: chartType,
        data: data,
        options: options
      });
    });
  });
  