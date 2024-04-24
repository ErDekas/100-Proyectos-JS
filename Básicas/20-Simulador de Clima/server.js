import express from 'express';
const app = express();

// Endpoint para obtener datos meteorológicos aleatorios
app.get('/weather', (req, res) => {
    // Generar datos meteorológicos aleatorios
    const temperature = getRandomNumber(-20, 40);
    const conditions = ['soleado', 'nublado', 'lluvioso', 'nevado'];
    const randomIndex = Math.floor(Math.random() * conditions.length);
    const weather = conditions[randomIndex];

    // Enviar datos como JSON
    res.json({ temperature, weather });
});

// Función para generar un número aleatorio en un rango dado
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

// Puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
