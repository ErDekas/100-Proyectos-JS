const rojo = document.getElementById('rojo');
const verde = document.getElementById('verde');
const azul = document.getElementById('azul');
const root = document.documentElement.style;

const cambiarRojo = e => root.setProperty('--red', e.target.value);
rojo.addEventListener('change' , e => cambiarRojo(e));
rojo.addEventListener('mousemove' , e => cambiarRojo(e));

const cambiarVerde = e => root.setProperty('--green', e.target.value);
verde.addEventListener('change' , e => cambiarVerde(e));
verde.addEventListener('mousemove' , e => cambiarVerde(e));

const cambiarAzul = e => root.setProperty('--blue', e.target.value);
azul.addEventListener('change' , e => cambiarAzul(e));
azul.addEventListener('mousemove' , e => cambiarAzul(e));