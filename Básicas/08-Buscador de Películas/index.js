document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm === '') {
        alert('Por favor ingrese el título de la película.');
        return;
    }

    const apiKey = '8523b925'; // Reemplaza 'tu_clave_api' con tu propia clave API de OMDb
    
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(searchTerm)}&apikey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            displayMovie(data);
        } else {
            alert('No se encontraron resultados para la película especificada.');
        }
    } catch (error) {
        console.error('Error al buscar película:', error);
        alert('Ocurrió un error al buscar la película. Por favor, inténtelo de nuevo más tarde.');
    }
});

function displayMovie(movieData) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');

    const titleElement = document.createElement('h2');
    titleElement.textContent = movieData.Title;
    movieElement.appendChild(titleElement);

    const genreElement = document.createElement('p');
    genreElement.textContent = `Género: ${movieData.Genre}`;
    movieElement.appendChild(genreElement);

    const ratingElement = document.createElement('p');
    ratingElement.textContent = `Valoración: ${movieData.imdbRating}`;
    movieElement.appendChild(ratingElement);

    const plotElement = document.createElement('p');
    plotElement.textContent = `Descripción: ${movieData.Plot}`;
    movieElement.appendChild(plotElement);

    searchResults.appendChild(movieElement);
}

