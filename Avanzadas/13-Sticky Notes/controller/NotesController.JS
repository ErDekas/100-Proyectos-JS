import { NotesModel } from "../model/NotesModel.js";
import { NotesView } from "../view/NotesView.js";

export class NotesController {
    constructor() {
        this.model = new NotesModel();
        this.view = new NotesView(this.model, 'notes-container');
        this.view.render();

        // Actualizar timestamps cada minuto
        setInterval(() => this.view.updateTimestamps(), 60000);
    }
}
