const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const codeEditor = document.getElementById('codeEditor');

saveButton.addEventListener('click', function() {
    const code = codeEditor.value;
    localStorage.setItem('savedCode', code);
    alert('Code saved successfully!');
});

loadButton.addEventListener('click', function() {
    const savedCode = localStorage.getItem('savedCode');
    if(savedCode) {
        codeEditor.value = savedCode;
        alert('Code loaded successfully!');
    } else {
        alert('No saved code found.');
    }
});
