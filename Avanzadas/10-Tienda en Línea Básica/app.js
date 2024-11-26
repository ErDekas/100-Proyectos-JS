class OnlineStore {
  constructor() {
    this.apiService = new ApiService();
    this.authService = new AuthService();
    this.storageService = new StorageService();

    this.productos = [];
    this.carrito = this.storageService.getCart() || [];

    this.initializeDOM();
    this.setupEventListeners();
    this.checkInitialAccess();
  }

  initializeDOM() {
    // Contenedores principales
    this.appContainer = document.getElementById("app");
    this.loginModal = document.getElementById("login-modal");
    this.registroModal = document.getElementById("registro-modal");
    this.productosContenedor = document.getElementById("products-container");
    this.carritoContenedor = document.getElementById("cart-container");

    // Elementos de control
    this.modoOscuroToggle = document.getElementById("modo-oscuro");
    this.checkoutBtn = document.getElementById("checkout-btn");
    this.carritoItems = document.getElementById("cart-items");
    this.carritoTotal = document.getElementById("cart-total");
    this.contadorCarrito = document.getElementById("cart-count");

    // Formularios
    this.loginForm = document.getElementById("login-form");
    this.registroForm = document.getElementById("registro-form");
    this.pagoForm = document.getElementById("pago-form");
  }

  setupEventListeners() {
    // Listeners de formularios
    this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    this.registroForm.addEventListener("submit", (e) => this.handleRegistro(e));

    // Navegación entre modales de login y registro
    document
      .getElementById("mostrar-registro")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.loginModal.classList.add("hidden");
        this.registroModal.classList.remove("hidden");
      });

    document.getElementById("mostrar-login").addEventListener("click", (e) => {
      e.preventDefault();
      this.registroModal.classList.add("hidden");
      this.loginModal.classList.remove("hidden");
    });

    // Otros listeners
    this.modoOscuroToggle.addEventListener("change", () =>
      this.toggleModoOscuro()
    );

    // Restricción de acceso a elementos interactivos
    this.checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.mostrarModalLogin();
    });

    // Iniciar proceso compra
    this.checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.iniciarProcesoCompra();
    });
  }

  checkInitialAccess() {
    // Bloquear toda la aplicación por defecto
    this.bloquearAccesoAplicacion();

    // Verificar si hay un usuario guardado
    const usuarioGuardado = this.authService.getCurrentUser();

    if (usuarioGuardado) {
      try {
        // Intentar iniciar sesión con el usuario guardado
        this.authService.currentUser = usuarioGuardado;
        this.desbloquearAccesoAplicacion();
        this.loadProducts();
      } catch (error) {
        // Si falla la validación, mostrar login
        this.mostrarModalLogin();
      }
    } else {
      // No hay usuario guardado, mostrar login
      this.mostrarModalLogin();
    }
  }

  bloquearAccesoAplicacion() {
    // Ocultar secciones principales
    this.productosContenedor.innerHTML = "";
    this.carritoContenedor.classList.add("hidden");

    // Deshabilitar botones y elementos interactivos
    this.checkoutBtn.disabled = true;

    // Mostrar solo el login
    this.loginModal.classList.remove("hidden");
  }

  desbloquearAccesoAplicacion() {
    // Mostrar secciones principales
    this.carritoContenedor.classList.remove("hidden");
    this.checkoutBtn.disabled = false;

    // Ocultar modales de login
    this.loginModal.classList.add("hidden");
    this.registroModal.classList.add("hidden");
  }

  mostrarModalLogin() {
    this.bloquearAccesoAplicacion();
    this.loginModal.classList.remove("hidden");
  }

  async loadProducts() {
    try {
      this.productos = await this.apiService.fetchProducts();
      this.renderizarProductos();
    } catch (error) {
      alert("Error al cargar productos. Por favor, inténtalo de nuevo.");
    }
  }

  renderizarProductos() {
    if (!this.authService.currentUser) {
      this.mostrarModalLogin();
      return;
    }

    this.productosContenedor.innerHTML = this.productos
      .map(
        (producto) => `
        <div class="product-card ${producto.stock === 0 ? "sin-stock" : ""}">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toFixed(2)}</p>
            <p>Stock: ${producto.stock}</p>
            <button 
                onclick="store.agregarAlCarrito(${producto.id})"
                ${producto.stock === 0 ? "disabled" : ""}
            >
                ${producto.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
            </button>
        </div>
    `
      )
      .join("");
  }

  agregarAlCarrito(idProducto) {
    const producto = this.productos.find((p) => p.id === idProducto);
    const productoExistente = this.carrito.find((p) => p.id === idProducto);

    if (productoExistente) {
      if (productoExistente.cantidad < producto.stock) {
        productoExistente.cantidad++;
      } else {
        alert("No hay más stock disponible");
        return;
      }
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }

    this.actualizarCarrito();
  }

  actualizarCarrito() {
    this.carritoItems.innerHTML = this.carrito
      .map(
        (producto) => `
            <div class="carrito-item">
                ${producto.nombre} - $${producto.precio.toFixed(2)} x ${
          producto.cantidad
        }
                <div class="carrito-controles">
                    <button onclick="store.reducirCantidad(${
                      producto.id
                    })">-</button>
                    <button onclick="store.aumentarCantidad(${
                      producto.id
                    })">+</button>
                    <button onclick="store.eliminarDelCarrito(${
                      producto.id
                    })">🗑️</button>
                </div>
            </div>
        `
      )
      .join("");

    const total = this.carrito.reduce(
      (sum, producto) => sum + producto.precio * producto.cantidad,
      0
    );
    this.carritoTotal.textContent = `Total: $${total.toFixed(2)}`;
    this.contadorCarrito.textContent = this.carrito.reduce(
      (sum, producto) => sum + producto.cantidad,
      0
    );

    this.storageService.saveCart(this.carrito);
  }

  reducirCantidad(idProducto) {
    const producto = this.carrito.find((p) => p.id === idProducto);
    if (producto.cantidad > 1) {
      producto.cantidad--;
    } else {
      this.eliminarDelCarrito(idProducto);
    }
    this.actualizarCarrito();
  }

  aumentarCantidad(idProducto) {
    const producto = this.carrito.find((p) => p.id === idProducto);
    const productoOriginal = this.productos.find((p) => p.id === idProducto);

    if (producto.cantidad < productoOriginal.stock) {
      producto.cantidad++;
      this.actualizarCarrito();
    } else {
      alert("No hay más stock disponible");
    }
  }

  eliminarDelCarrito(idProducto) {
    this.carrito = this.carrito.filter(
      (producto) => producto.id !== idProducto
    );
    this.actualizarCarrito();
  }

  iniciarProcesoCompra() {
    if (!this.authService.currentUser) {
      alert("Debes iniciar sesión para finalizar la compra");
      this.loginModal.classList.remove("hidden");
      return;
    }

    const compraValida = this.carrito.every((itemCarrito) => {
      const productoOriginal = this.productos.find(
        (p) => p.id === itemCarrito.id
      );
      return itemCarrito.cantidad <= productoOriginal.stock;
    });

    if (!compraValida) {
      alert("Algunos productos no tienen suficiente stock");
      return;
    }

    // Reinicia el carrito visual y en almacenamiento antes de proceder
    this.carrito = [];
    this.storageService.clearCart();
    this.actualizarCarrito();

    // Mostrar formulario de pago
    const pagoModal = document.getElementById("pago-modal");
    if (pagoModal) {
      pagoModal.classList.remove("hidden");
      const totalCompra = this.carrito.reduce(
        (sum, producto) => sum + producto.precio * producto.cantidad,
        0
      );
      const totalPagoElement = document.getElementById("total-pago");
      if (totalPagoElement) {
        totalPagoElement.textContent = `Total a pagar: $${totalCompra.toFixed(
          2
        )}`;
      }
    }
  }

  procesarPago(e) {
    e.preventDefault();

    const numero = document.getElementById("numero-tarjeta").value;
    const fechaExpiracion = document.getElementById("fecha-expiracion").value;
    const cvv = document.getElementById("cvv").value;
    const nombreTitular = document.getElementById("nombre-titular").value;

    const totalCompra = this.carrito.reduce(
      (sum, producto) => sum + producto.precio * producto.cantidad,
      0
    );

    try {
      const datosPago = {
        numero,
        fechaExpiracion,
        cvv,
        nombreTitular,
        monto: totalCompra,
      };

      // Procesar pago
      const resultadoPago = this.authService.procesarPago(datosPago);

      if (resultadoPago.estado === "APROBADO") {
        // Actualizar stock de productos
        this.carrito.forEach((itemCarrito) => {
          const productoOriginal = this.productos.find(
            (p) => p.id === itemCarrito.id
          );
          productoOriginal.stock -= itemCarrito.cantidad;
        });

        alert(
          `¡Compra realizada con éxito! ID de transacción: ${resultadoPago.transaccionId}`
        );

        // Limpiar carrito y actualizar interfaz
        this.storageService.clearCart(); // Limpia el almacenamiento local
        this.carrito = []; // Limpia el carrito en memoria
        this.actualizarCarrito();
        this.renderizarProductos();

        // Ocultar modal de pago
        const pagoModal = document.getElementById("pago-modal");
        if (pagoModal) {
          pagoModal.classList.add("hidden");
        }
      }
    } catch (error) {
      alert(`Error en el pago: ${error.message}`);
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const correo = document.getElementById("login-correo").value;
    const contrasena = document.getElementById("login-contrasena").value;

    try {
      const usuario = this.authService.login(correo, contrasena);
      this.desbloquearAccesoAplicacion();
      this.loadProducts();
      this.actualizarCarrito();
    } catch (error) {
      alert(error.message);
    }
  }

  handleRegistro(e) {
    e.preventDefault();
    const correo = document.getElementById("registro-correo").value;
    const contrasena = document.getElementById("registro-contrasena").value;
    const repetirContrasena = document.getElementById(
      "registro-repetir-contrasena"
    ).value;

    try {
      const nuevoUsuario = this.authService.registrarUsuario(
        correo,
        contrasena,
        repetirContrasena
      );
      alert("Usuario registrado con éxito");

      // Iniciar sesión automáticamente
      this.authService.currentUser = nuevoUsuario;
      this.desbloquearAccesoAplicacion();
      this.loadProducts();
    } catch (error) {
      alert(error.message);
    }
  }

  checkAuthStatus() {
    const user =
      this.authService.currentUser ||
      JSON.parse(localStorage.getItem("usuarioActual"));
    if (user) {
      this.authService.currentUser = user;
      this.loginModal.classList.add("hidden");
    }
  }

  toggleModoOscuro() {
    document.body.classList.toggle("modo-oscuro");
    localStorage.setItem(
      "modo-oscuro",
      document.body.classList.contains("modo-oscuro")
    );
  }
}

// Inicialización de la tienda
const store = new OnlineStore();
