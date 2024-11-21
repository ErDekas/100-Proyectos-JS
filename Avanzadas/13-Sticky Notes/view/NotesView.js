// Vista: Renderizado de notas
export class NotesView {
    constructor(model, containerId) {
        this.model = model;
        this.container = document.getElementById(containerId);
        this.viewSelector = document.getElementById('view-selector');
        this.newNoteBtn = document.getElementById('new-note-btn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.viewSelector.addEventListener('change', () => this.render());
        this.newNoteBtn.addEventListener('click', () => this.showNewNoteModal());
    }

    showNewNoteModal() {
        const modal = document.getElementById('new-note-modal');
        modal.style.display = 'block';
        document.getElementById('save-note-btn').onclick = () => {
            const title = document.getElementById('note-title').value;
            const content = document.getElementById('note-content').value;
            if (title && content) {
                this.model.addNote(title, content);
                this.render();
                modal.style.display = 'none';
            }
        };
    }

    render() {
        const view = this.viewSelector.value;
        this.container.innerHTML = '';
        this.container.className = `${view}-view`;

        this.model.getNotes().forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            noteEl.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="note-time" data-id="${note.id}"></div>
                <div class="note-actions">
                    <button class="edit-btn" data-id="${note.id}">Editar</button>
                    <button class="delete-btn" data-id="${note.id}">Eliminar</button>
                </div>
            `;
            
            if (view === 'grid') {
                noteEl.style.position = 'absolute';
                noteEl.style.left = `${note.position.x}px`;
                noteEl.style.top = `${note.position.y}px`;
            }

            // Eventos para editar y eliminar
            noteEl.querySelector('.edit-btn').addEventListener('click', () => this.editNote(note.id));
            noteEl.querySelector('.delete-btn').addEventListener('click', () => this.deleteNote(note.id));

            this.container.appendChild(noteEl);
        });

        this.setupDragAndDrop();
        this.updateTimestamps();
    }

    setupDragAndDrop() {
        const notes = this.container.querySelectorAll('.note');
        notes.forEach(note => {
            note.addEventListener('mousedown', this.startDrag);
        });
    }

    startDrag(e) {
        const note = e.target.closest('.note');
        const initialX = e.clientX - note.offsetLeft;
        const initialY = e.clientY - note.offsetTop;

        function dragMove(e) {
            note.style.left = `${e.clientX - initialX}px`;
            note.style.top = `${e.clientY - initialY}px`;
        }

        function stopDrag() {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', stopDrag);
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', stopDrag);
    }

    editNote(id) {
        const note = this.model.getNotes().find(n => n.id === id);
        const newTitle = prompt('Editar título', note.title);
        const newContent = prompt('Editar contenido', note.content);
        
        if (newTitle !== null && newContent !== null) {
            this.model.updateNote(id, { title: newTitle, content: newContent });
            this.render();
        }
    }

    deleteNote(id) {
        this.model.deleteNote(id);
        this.render();
    }

    updateTimestamps() {
        const timeEls = document.querySelectorAll('.note-time');
        timeEls.forEach(el => {
            const note = this.model.getNotes().find(n => n.id === Number(el.dataset.id));
            const minutes = Math.floor((new Date() - new Date(note.createdAt)) / 60000);
            el.textContent = `Hace ${minutes} minutos`;
        });
    }
}