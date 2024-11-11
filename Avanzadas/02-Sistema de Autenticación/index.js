// Funciones para mostrar formularios
function showRegisterForm() {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}

function showLoginForm() {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

function backToStart() {
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
}

// Función para registrar un nuevo usuario
function register() {
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validaciones
  if (username.length < 2) {
    alert("El nombre de usuario debe tener al menos 2 caracteres.");
    return;
  }

  const emailPattern =
    /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.es|hotmail\.com)$/;
  if (!emailPattern.test(email)) {
    alert(
      "Correo no válido. Solo se permiten @gmail.com, @yahoo.es, @hotmail.com."
    );
    return;
  }

  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  if (!passwordPattern.test(password)) {
    alert(
      "La contraseña debe tener al menos 8 caracteres y contener letras y números."
    );
    return;
  }

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  // Guardamos el usuario
  const userData = { username, email, password };
  localStorage.setItem(username, JSON.stringify(userData));
  alert("Usuario registrado exitosamente.");
  backToStart();
}

// Función para iniciar sesión
function login() {
  const userInput = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPassword").value;

  let userFound = null;

  // Buscar usuario por nombre o email
  for (let key in localStorage) {
    const userData = JSON.parse(localStorage.getItem(key));
    if (
      userData &&
      (userData.username === userInput || userData.email === userInput)
    ) {
      userFound = userData;
      break;
    }
  }

  if (userFound && userFound.password === password) {
    alert("Inicio de sesión exitoso.");
    showWelcomeMessage(userFound.username);
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}

// Función para mostrar el mensaje de bienvenida
function showWelcomeMessage(username) {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("welcomeMessage").classList.remove("hidden");
  document.getElementById("user").textContent = username;
}

// Función para cerrar sesión
function logout() {
  alert("Cerraste sesión.");
  document.getElementById("welcomeMessage").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
}
