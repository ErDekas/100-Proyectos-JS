document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addButton');
    const inputContainer = document.getElementById('inputContainer');
    const itemInput = document.getElementById('itemInput');
    const submitButton = document.getElementById('submitButton');
    const shoppingList = document.getElementById('shoppingList');

    addButton.addEventListener('click', function() {
        inputContainer.style.display = 'block';
    });

    submitButton.addEventListener('click', function() {
        const newItemText = itemInput.value.trim();
        if (newItemText !== '') {
            addItemToList(newItemText);
            itemInput.value = ''; // Limpiar el campo de texto
            inputContainer.style.display = 'none'; // Ocultar el contenedor de entrada
        }
    });

    function addItemToList(text) {
        const li = document.createElement('li');
        li.textContent = text;
        li.addEventListener('click', function() {
            if (!li.classList.contains('completed')) {
                li.classList.add('completed');
                li.removeEventListener('click', toggleCompleted);
            }
        });
        shoppingList.appendChild(li);
    }
});
