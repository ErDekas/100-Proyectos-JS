const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

editor.addEventListener('input', () => {
    renderPreview(editor.value);
});
const renderPreview = (text) => {
    preview.innerHTML = marked(text);
    preview.style.color = 'rgb(63, 60, 60)';
}