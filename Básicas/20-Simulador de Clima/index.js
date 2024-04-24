document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const weatherData = document.getElementById('weatherData');

    searchButton.addEventListener('click', function() {
        const location = searchInput.value.trim();
        if (location !== '') {
            getWeatherData(location);
        }
    });

    async function getWeatherData(location) {
        try {
            const response = await fetch(`http://localhost:3000/weather?location=${location}`);
            const data = await response.json();

            displayWeatherData(data);
        } catch (error) {
            console.error('Error al obtener datos meteorológicos:', error);
            weatherData.innerHTML = 'Error al obtener datos meteorológicos';
            weatherData.classList.remove('hidden');
        }
    }

    function displayWeatherData(data) {
        const temperature = data.temperature;
        const description = data.weather;

        weatherData.innerHTML = `
            <h2>${searchInput.value}</h2>
            <p>Temperatura: ${temperature} °C</p>
            <p>Clima: ${description}</p>
        `;
        weatherData.classList.remove('hidden');
    }
});
