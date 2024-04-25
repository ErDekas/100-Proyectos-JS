async function searchBooks() {
    const searchTerm = document.getElementById('searchTerm').value;
    const url = `https://openlibrary.org/search.json?q=${searchTerm}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      displayResults(data.docs);
    } catch (error) {
      console.error('Error al buscar libros:', error);
    }
  }
  
  function displayResults(books) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Limpiar resultados anteriores
  
    if (books.length === 0) {
      resultsDiv.innerHTML = '<p>No se encontraron resultados.</p>';
      return;
    }
  
    const ul = document.createElement('ul');
    books.forEach(book => {
      const li = document.createElement('li');
      li.textContent = `${book.title} by ${book.author_name ? book.author_name.join(', ') : 'Autor Desconocido'}`;
      ul.appendChild(li);
    });
    resultsDiv.appendChild(ul);
  }