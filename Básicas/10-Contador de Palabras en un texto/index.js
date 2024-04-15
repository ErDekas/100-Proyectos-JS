const texto = document.getElementById("texto");
const boton = document.getElementById("boton");

boton.addEventListener("click", () => {
    const palabras = texto.value.split(/\s+/);
    const totalPalabras = palabras.length;
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `El texto tiene ${totalPalabras} palabras`;
})

