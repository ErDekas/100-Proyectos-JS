// Modelo: Gestión de datos de notas
export class NotesModel {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes') || '[]');
    }

    addNote(title, content) {
        const note = {
            id: Date.now(),
            title,
            content,
            createdAt: new Date().toISOString(),
            position: { x: Math.random() * 500, y: Math.random() * 500 }
        };
        this.notes.push(note);
        this.saveNotes();
        return note;
    }

    updateNote(id, updates) {
        const note = this.notes.find(n => n.id === id);
        Object.assign(note, updates);
        this.saveNotes();
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    getNotes() {
        return this.notes;
    }
}