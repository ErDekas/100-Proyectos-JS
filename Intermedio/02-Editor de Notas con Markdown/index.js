import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
const markdownInput = document.getElementById('markdownInput');
const preview = document.getElementById('preview');

const updatePreview = () => {
    const markdownText = markdownInput.value;
    const htmlText = md.render(markdownText);
    preview.innerHTML = htmlText;
}
markdownInput.addEventListener('input', updatePreview);

updatePreview();