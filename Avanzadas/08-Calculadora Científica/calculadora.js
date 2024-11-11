import { botones } from "./botones.js";

const pantalla = document.getElementById("pantalla");
const botonera = document.getElementById("botonera");

const LIMITE_CARACTERES = 30; // Establecer el límite de caracteres

let valorEnPantalla = "";
let enRadianes = true;
let modoCientifico = true;
let historial = [];
let indiceHistorial = -1;

// Crear los botones de la calculadora dinámicamente
botones.forEach((boton) => {
  const buttonElement = document.createElement("button");
  buttonElement.textContent = boton.text;
  buttonElement.classList.add(boton.type);

  buttonElement.addEventListener("click", () =>
    manejarClick(boton.text, boton.type)
  );

  botonera.appendChild(buttonElement);
});

function manejarClick(texto, tipo) {
  if (!modoCientifico && (texto === "(" || texto === ")" || texto === "!")) {
    return; // No hacer nada en modo normal si se presionan estos botones
  }

  switch (tipo) {
    case "clear":
      valorEnPantalla = "";
      indiceHistorial = historial.length; // Establecer índice en la última operación
      break;
    case "equals":
      try {
        const resultado = evaluarExpresion(valorEnPantalla);
        historial.push(valorEnPantalla);
        indiceHistorial = historial.length;
        valorEnPantalla = String(resultado);
      } catch (e) {
        valorEnPantalla = "Error";
      }
      break;
    case "sqrt":
      valorEnPantalla += "√";
      break;
    case "log":
      valorEnPantalla += "log(";
      break;
    case "ln":
      valorEnPantalla += "ln(";
      break;
    case "sin":
      valorEnPantalla += "sin(";
      break;
    case "cos":
      valorEnPantalla += "cos(";
      break;
    case "tan":
      valorEnPantalla += "tan(";
      break;
    case "asin":
      valorEnPantalla += "sin⁻¹(";
      break;
    case "acos":
      valorEnPantalla += "cos⁻¹(";
      break;
    case "atan":
      valorEnPantalla += "tan⁻¹(";
      break;
    case "power":
      valorEnPantalla += "**";
      break;
    case "square":
      valorEnPantalla += "**2";
      break;
    case "e":
      valorEnPantalla += Math.E;
      break;
    case "tenPower":
      valorEnPantalla += "10**";
      break;
    case "exp":
      valorEnPantalla += "e**(";
      break;
    case "pi":
      valorEnPantalla += Math.PI;
      break;
    case "doubleZero":
      valorEnPantalla += "00";
      break;
    case "percent":
      try {
        const expresionConvertida = valorEnPantalla;
        valorEnPantalla = eval(expresionConvertida) / 100;
      } catch {
        valorEnPantalla = "Error";
      }
      break;
    case "openParen":
      valorEnPantalla += "(";
      break;
    case "closeParen":
      valorEnPantalla += ")";
      break;
    case "backspace":
      valorEnPantalla = valorEnPantalla.slice(0, -1);
      break;
    case "toggleAngle":
      enRadianes = !enRadianes;
      actualizarTextoBotonAngulo(); // Llamar a la función para actualizar el texto del botón
      break;
    case "modeToggle":
      modoCientifico = !modoCientifico;
      actualizarModo();
      break;
    case "factorial":
      valorEnPantalla += "!";
      break;
    default:
      if (valorEnPantalla.length < LIMITE_CARACTERES) {
        valorEnPantalla += texto; // Agregar texto al valor en pantalla
      }
      break;
  }

  pantalla.textContent = valorEnPantalla; // Actualizar la pantalla
}

// Función para evaluar expresiones matemáticas con soporte para funciones
function evaluarExpresion(exp) {
  exp = exp
    .replace(/√\((.*?)\)/g, "Math.sqrt($1)")
    .replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)")
    .replace(/log\((.*?)\)/g, "Math.log10($1)")
    .replace(/ln\((.*?)\)/g, "Math.log($1)")
    .replace(/sin\((.*?)\)/g, (_, valor) =>
      convertirSin(evaluarExpresion(valor))
    )
    .replace(/cos\((.*?)\)/g, (_, valor) =>
      convertirCos(evaluarExpresion(valor))
    )
    .replace(/tan\((.*?)\)/g, (_, valor) =>
      convertirTan(evaluarExpresion(valor))
    )
    .replace(/sin⁻¹\((.*?)\)/g, (_, valor) =>
      convertirAsin(evaluarExpresion(valor))
    )
    .replace(/cos⁻¹\((.*?)\)/g, (_, valor) =>
      convertirAcos(evaluarExpresion(valor))
    )
    .replace(/tan⁻¹\((.*?)\)/g, (_, valor) =>
      convertirAtan(evaluarExpresion(valor))
    )
    .replace(/pi/g, "Math.PI")
    .replace(/e/g, "Math.E")
    .replace(/exp\((.*?)\)/g, "Math.exp($1)")
    .replace(/(\d+(\.\d+)?)%/g, "($1/100)")
    .replace(/\(([^()]+)\)%/g, "(($1)/100)")
    .replace(/\((.*?)\)!/g, (_, expr) => factorial(evaluarExpresion(expr))) // Factorial de una expresión
    .replace(/(\d+)!/g, (_, num) => factorial(parseInt(num))); // Factorial de un número
  return Function(`"use strict"; return (${exp})`)();
}

// Función para calcular el factorial
function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
}

function convertirSin(valor) {
  return enRadianes ? Math.sin(valor) : Math.sin((valor * Math.PI) / 180);
}

function convertirCos(valor) {
  return enRadianes ? Math.cos(valor) : Math.cos((valor * Math.PI) / 180);
}

function convertirTan(valor) {
  return enRadianes ? Math.tan(valor) : Math.tan((valor * Math.PI) / 180);
}

function convertirAsin(valor) {
  if (valor < -1 || valor > 1) return NaN; // Validación de dominio
  return enRadianes ? Math.asin(valor) : (Math.asin(valor) * 180) / Math.PI;
}

function convertirAcos(valor) {
  if (valor < -1 || valor > 1) return NaN; // Validación de dominio
  return enRadianes ? Math.acos(valor) : (Math.acos(valor) * 180) / Math.PI;
}

function convertirAtan(valor) {
  return enRadianes ? Math.atan(valor) : (Math.atan(valor) * 180) / Math.PI;
}

// Función para alternar los botones del modo científico
function actualizarModo() {
  const botonesCientificos = [
    "sqrt",
    "log",
    "ln",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "power",
    "square",
    "e",
    "tenPower",
    "exp",
    "pi",
    "factorial",
    "openParen",
    "closeParen",
    "trig",
    "toggleAngle",
    "doubleZero",
  ];

  botones.forEach((boton) => {
    const buttonElement = document.querySelector(`button.${boton.type}`);
    if (botonesCientificos.includes(boton.type)) {
      buttonElement.style.display = modoCientifico ? "block" : "none";
    }
  });

  const modoToggleButton = document.querySelector(`button.modeToggle`);
  modoToggleButton.textContent = modoCientifico ? "Normal" : "Científica";
}

// Función para actualizar el texto del botón de grados/radianes
function actualizarTextoBotonAngulo() {
  const botonAngulo = document.querySelector(`button.toggleAngle`);
  botonAngulo.textContent = enRadianes ? "Grados" : "Radianes"; // Cambiar texto según el estado
}

// Llamada inicial para establecer el texto del botón al cargar
actualizarTextoBotonAngulo();

// Mapeo de teclas a botones de la calculadora
const teclaMapeo = {
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
  ".": ".",
  Enter: "equals",
  Backspace: "backspace",
  Escape: "clear",
  Tab: "modeToggle",
  ArrowUp: "historyUp",
  ArrowDown: "historyDown",
  ")": ")",
  "(": "(",
  "%": "%",
  "!": "!",
};

document.addEventListener("keydown", (event) => {
  const tecla = teclaMapeo[event.key];

  // Deshabilitar entrada de paréntesis y factorial en modo normal
  if (
    !modoCientifico &&
    (event.key === "(" || event.key === ")" || event.key === "!")
  ) {
    event.preventDefault(); // Prevenir comportamiento predeterminado
    return; // No hacer nada más
  }

  if (tecla) {
    if (tecla === "equals") {
      manejarClick("", "equals");
    } else if (tecla === "clear") {
      manejarClick("", "clear");
    } else if (tecla === "backspace") {
      manejarClick("", "backspace");
    } else if (tecla === "modeToggle") {
      manejarClick("", "modeToggle");
    } else if (["historyUp", "historyDown"].includes(tecla)) {
      manejarHistorial(tecla);
    } else manejarClick(tecla, "number");
    event.preventDefault();
  }
});

// Función para manejar navegación en el historial
function manejarHistorial(tecla) {
  if (tecla === "historyUp" && indiceHistorial > 0) {
    indiceHistorial--;
    valorEnPantalla = historial[indiceHistorial];
  } else if (tecla === "historyDown") {
    if (indiceHistorial < historial.length - 1) {
      indiceHistorial++;
      valorEnPantalla = historial[indiceHistorial];
    } else {
      valorEnPantalla = "";
      indiceHistorial = historial.length;
    }
  }
  pantalla.textContent = valorEnPantalla;
}
