document.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generateButton');
    const cardForm = document.querySelector('.card-form');
    const cardContainer = document.querySelector('.card-container');
    const nameInput = document.getElementById('nameInput');
    const textInput = document.getElementById('textInput');
    const cardName = document.getElementById('cardName');
    const cardText = document.getElementById('cardText');
    const cardFormElement = document.getElementById('cardForm');

    generateButton.addEventListener('click', function() {
        document.querySelector('.welcome-screen').classList.add('hidden');
        cardForm.classList.remove('hidden');
    });

    cardFormElement.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar el envío del formulario

        const name = nameInput.value.trim();
        const text = textInput.value.trim();

        if (name !== '' && text !== '') {
            cardName.textContent = name;
            cardText.textContent = text;
            cardContainer.classList.remove('hidden');
            cardForm.classList.add('hidden');
        }
    });
});
