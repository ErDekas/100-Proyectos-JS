// Servicio de Autenticación Extendido
class AuthService {
  constructor() {
    this.usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    this.currentUser = null;
  }

  // Validaciones de registro
  validarCorreo(correo) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
  }

  validarContrasena(contrasena) {
    // Mínimo 8 caracteres, una mayúscula, un número y un carácter especial
    const regexContrasena =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#.?&]).{8,}$/;
    return regexContrasena.test(contrasena);
  }

  registrarUsuario(correo, contrasena, repetirContrasena) {
    // Validaciones
    if (!this.validarCorreo(correo)) {
      throw new Error("Correo electrónico inválido");
    }

    if (this.usuarios.some((usuario) => usuario.correo === correo)) {
      throw new Error("El correo ya está registrado");
    }

    if (contrasena !== repetirContrasena) {
      throw new Error("Las contraseñas no coinciden");
    }

    if (!this.validarContrasena(contrasena)) {
      throw new Error(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
      );
    }

    // Hashear contraseña (simulado)
    const salt = this.generarSalt();
    const contrasenaHash = this.hashContrasena(contrasena, salt);

    const nuevoUsuario = {
      id: Date.now(),
      correo,
      contrasena: contrasenaHash,
      salt,
      fechaRegistro: new Date().toISOString(),
    };

    this.usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(this.usuarios));

    return nuevoUsuario;
  }

  login(correo, contrasena) {
    const usuario = this.usuarios.find((u) => u.correo === correo);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar contraseña hasheada
    const contrasenaHash = this.hashContrasena(contrasena, usuario.salt);

    if (contrasenaHash !== usuario.contrasena) {
      throw new Error("Contraseña incorrecta");
    }

    this.currentUser = usuario;
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));

    return usuario;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("usuarioActual");
  }

  // Métodos de hashing (simulados)
  generarSalt() {
    return Math.random().toString(36).substring(2, 15);
  }

  hashContrasena(contrasena, salt) {
    // Simulación de hashing (en producción, usar bcrypt o similar)
    return btoa(contrasena + salt);
  }

  // Validación de tarjeta de crédito
  validarTarjetaCredito(numero, fechaExpiracion, cvv, nombreTitular) {
    // Validación de número de tarjeta (algoritmo de Luhn)
    const validarNumeroTarjeta = (numero) => {
      numero = numero.replace(/\s/g, "");
      if (!/^\d+$/.test(numero)) return false;

      let suma = 0;
      let esSegundoDigito = false;

      for (let i = numero.length - 1; i >= 0; i--) {
        let digito = parseInt(numero.charAt(i), 10);

        if (esSegundoDigito) {
          digito *= 2;
          if (digito > 9) {
            digito -= 9;
          }
        }

        suma += digito;
        esSegundoDigito = !esSegundoDigito;
      }

      return suma % 10 === 0;
    };

    // Validación de fecha de expiración
    const validarFechaExpiracion = (fecha) => {
      const [mes, año] = fecha.split("/");
      const fechaExpiracion = new Date(`20${año}`, mes - 1);
      return fechaExpiracion > new Date();
    };

    // Validación de CVV
    const validarCVV = (cvv) => {
      return /^\d{3,4}$/.test(cvv);
    };

    // Validación de nombre del titular (no debe contener letras minúsculas)
    const validarNombreTitular = (nombre) => {
      return /^[^a-z]+$/.test(nombre); // Acepta solo caracteres que no sean letras minúsculas
    };

    return {
      numeroValido: validarNumeroTarjeta(numero),
      fechaValida: validarFechaExpiracion(fechaExpiracion),
      cvvValido: validarCVV(cvv),
      nombreTitularValido: validarNombreTitular(nombreTitular),
    };
  }

  procesarPago(datosPago) {
    const { numero, fechaExpiracion, cvv, nombreTitular, monto } = datosPago;

    const validacion = this.validarTarjetaCredito(numero, fechaExpiracion, cvv);

    if (!validacion.numeroValido) {
      throw new Error("Número de tarjeta inválido");
    }

    if (!validacion.fechaValida) {
      throw new Error("Tarjeta expirada");
    }

    if (!validacion.cvvValido) {
      throw new Error("CVV inválido");
    }

    // Simulación de procesamiento de pago
    return {
      estado: "APROBADO",
      transaccionId: `TRANS-${Date.now()}`,
      monto,
      fechaProcesamiento: new Date().toISOString(),
    };
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("usuarioActual"));
  }
}
