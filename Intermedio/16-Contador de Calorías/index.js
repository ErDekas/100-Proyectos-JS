// script.js
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('caloriesForm');
    const foodInput = document.getElementById('food');
    const caloriesInput = document.getElementById('calories');
    const foodList = document.getElementById('foodList');
    const totalCaloriesSpan = document.getElementById('totalCalories');
    
    let totalCalories = 0;
    
    // Función para agregar un nuevo alimento a la lista
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const food = foodInput.value.trim();
        const calories = parseInt(caloriesInput.value.trim(), 10);

        // Validar que ambos campos sean correctos
        if (food && !isNaN(calories) && calories > 0) {
            // Crear un nuevo elemento en la lista
            const listItem = document.createElement('li');
            listItem.textContent = `${food}: ${calories} calorías`;
            
            // Añadirlo a la lista
            foodList.appendChild(listItem);
            
            // Actualizar el total de calorías
            totalCalories += calories;
            totalCaloriesSpan.textContent = totalCalories;
            
            // Limpiar los campos del formulario
            foodInput.value = '';
            caloriesInput.value = '';
        } else {
            alert('Por favor, ingresa un alimento y una cantidad válida de calorías.');
        }
    });
});
