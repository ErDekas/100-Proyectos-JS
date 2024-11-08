// Función para cargar los contactos desde el localStorage
function loadContacts() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];  // Obtener los contactos o un arreglo vacío si no existen
    const contactList = document.getElementById('contact-list');
    contactList.innerHTML = '';  // Limpiar la lista antes de volver a agregarla

    // Agregar los contactos desde el localStorage
    contacts.forEach(contact => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${contact.name}</strong><br>${contact.phone}<br>${contact.email}</span>
            <button class="delete">Eliminar</button>
        `;
        contactList.appendChild(li);

        // Agregar evento para eliminar el contacto
        li.querySelector('.delete').addEventListener('click', function () {
            deleteContact(contact.name);  // Eliminar el contacto por nombre
        });
    });
}

// Función para agregar un nuevo contacto
function addContact(event) {
    event.preventDefault();  // Prevenir la recarga de la página al enviar el formulario

    // Obtener los valores de los inputs
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    // Crear un nuevo objeto de contacto
    const newContact = { name, phone, email };

    // Obtener los contactos actuales desde el localStorage
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];

    // Agregar el nuevo contacto al arreglo de contactos
    contacts.push(newContact);

    // Guardar la lista actualizada de contactos en localStorage
    localStorage.setItem('contacts', JSON.stringify(contacts));

    // Limpiar el formulario
    document.getElementById('contact-form').reset();

    // Recargar la lista de contactos
    loadContacts();
}

// Función para eliminar un contacto
function deleteContact(name) {
    // Obtener los contactos actuales desde el localStorage
    let contacts = JSON.parse(localStorage.getItem('contacts')) || [];

    // Filtrar el contacto por nombre y eliminarlo
    contacts = contacts.filter(contact => contact.name !== name);

    // Guardar la lista actualizada de contactos en localStorage
    localStorage.setItem('contacts', JSON.stringify(contacts));

    // Recargar la lista de contactos
    loadContacts();
}

// Escuchar el evento de submit para agregar un contacto
document.getElementById('contact-form').addEventListener('submit', addContact);

// Cargar los contactos al cargar la página
window.addEventListener('load', loadContacts);
