// Configuración inicial
const config = {
    horarioAtencion: {
        inicio: 9,
        fin: 18
    },
    capacidadMaxima: {
        porHora: 3,
        porDia: 15
    },
    duracionCita: 60
};

class UsuarioManager {
    constructor() {
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};
        this.usuarioActual = null;
        this.initEventListeners();
    }

    initEventListeners() {
        // Botones de los modales
        document.getElementById('btnLogin').addEventListener('click', () => this.mostrarModal('modalLogin'));
        document.getElementById('btnRegistro').addEventListener('click', () => this.mostrarModal('modalRegistro'));

        // Cerrar modales
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Submit de formularios
        document.querySelector('#modalLogin .btn-primary').addEventListener('click', () => this.handleLogin());
        document.querySelector('#modalRegistro .btn-primary').addEventListener('click', () => this.handleRegistro());
    }

    mostrarModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await this.login(email, password);
            document.getElementById('modalLogin').style.display = 'none';
            this.actualizarUIAutenticacion();
        } catch (error) {
            alert(error.message);
        }
    }

    async handleRegistro() {
        const email = document.getElementById('registroEmail').value;
        const password = document.getElementById('registroPassword').value;
        
        try {
            await this.registrarUsuario(email, password);
            document.getElementById('modalRegistro').style.display = 'none';
            mostrarMensaje('Usuario registrado con éxito', 'success');
        } catch (error) {
            alert(error.message);
        }
    }

    actualizarUIAutenticacion() {
        const authSection = document.querySelector('.auth-section');
        if (this.usuarioActual) {
            authSection.innerHTML = `
                <span>Bienvenido ${this.usuarioActual}</span>
                <button class="btn btn-primary" onclick="sistema.usuarioManager.logout()">Cerrar Sesión</button>
            `;
        } else {
            authSection.innerHTML = `
                <button class="btn btn-primary" id="btnLogin">Iniciar Sesión</button>
                <button class="btn btn-primary" id="btnRegistro">Registrarse</button>
            `;
            this.initEventListeners();
        }
    }

    async registrarUsuario(email, password) {
        if (this.usuarios[email]) {
            throw new Error('El usuario ya existe');
        }
        
        this.usuarios[email] = {
            password,
            verificado: false,
            token: this.generarToken()
        };
        
        this.guardarUsuarios();
        await this.enviarEmailVerificacion(email);
    }

    async login(email, password) {
        const usuario = this.usuarios[email];
        if (!usuario || usuario.password !== password) {
            throw new Error('Credenciales inválidas');
        }
        if (!usuario.verificado) {
            usuario.verificado = true; // Para pruebas, verificar automáticamente
            this.guardarUsuarios();
        }
        this.usuarioActual = email;
        this.actualizarUIAutenticacion();
        sistema.actualizarResumen(); // Actualizar el resumen al iniciar sesión
        return true;
    }

    logout() {
        this.usuarioActual = null;
        this.actualizarUIAutenticacion();
        sistema.actualizarResumen(); // Limpiar el resumen al cerrar sesión
    }    

    verificarEmail(email, token) {
        const usuario = this.usuarios[email];
        if (usuario && usuario.token === token) {
            usuario.verificado = true;
            this.guardarUsuarios();
            return true;
        }
        return false;
    }

    generarToken() {
        return Math.random().toString(36).substr(2);
    }

    guardarUsuarios() {
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    }

    async enviarEmailVerificacion(email) {
        console.log(`Email de verificación enviado a ${email} con token: ${this.usuarios[email].token}`);
    }

    estaAutenticado() {
        return this.usuarioActual !== null;
    }
}

class SistemaReservas {
    constructor() {
        this.reservas = JSON.parse(localStorage.getItem('reservas')) || {};
        this.usuarioManager = new UsuarioManager();
        this.initCalendario();
    }

    initCalendario() {
        const calendario = document.getElementById('calendario');
        if (!calendario) return;

        const fecha = new Date();
        this.renderizarCalendario(fecha.getMonth(), fecha.getFullYear());
    }

    renderizarCalendario(mes, año) {
        const calendario = document.getElementById('calendario');
        calendario.innerHTML = '';

        const hoy = new Date();
        const diasMes = new Date(año, mes + 1, 0).getDate();
        const primerDia = new Date(año, mes, 1).getDay();

        // Renderizar encabezado
        const encabezado = document.createElement('div');
        encabezado.className = 'calendario-header';
        encabezado.innerHTML = `
            <button onclick="sistema.cambiarMes(-1)">‹</button>
            <span>${new Date(año, mes).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            <button onclick="sistema.cambiarMes(1)">›</button>
        `;
        calendario.appendChild(encabezado);

        // Renderizar días de la semana
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        diasSemana.forEach(dia => {
            const diaElement = document.createElement('div');
            diaElement.className = 'dia-semana';
            diaElement.textContent = dia;
            calendario.appendChild(diaElement);
        });

        // Espacios vacíos para el primer día
        for (let i = 0; i < primerDia; i++) {
            const espacioVacio = document.createElement('div');
            espacioVacio.className = 'dia vacio';
            calendario.appendChild(espacioVacio);
        }

        // Renderizar días del mes
        for (let dia = 1; dia <= diasMes; dia++) {
            const fecha = new Date(año, mes, dia);
            const fechaStr = fecha.toISOString().split('T')[0];

            const diaElement = document.createElement('div');
            diaElement.className = 'dia';
            diaElement.textContent = dia;
            diaElement.setAttribute('data-fecha', fechaStr);

            // Verificar si es hoy
            if (dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear()) {
                diaElement.classList.add('hoy');
            }

            // Aplicar colores según disponibilidad
            this.aplicarColorDia(diaElement, fecha);

            // Agregar evento click si está disponible
            if (this.verificarDisponibilidad(fecha)) {
                diaElement.classList.add('disponible');
                diaElement.onclick = () => this.mostrarHorariosDisponibles(fecha);
            } else {
                diaElement.classList.add('no-disponible');
            }

            calendario.appendChild(diaElement);
        }
    }

    aplicarColorDia(diaElement, fecha) {
        const fechaStr = fecha.toISOString().split('T')[0];
        const reservasDia = this.reservas[fechaStr] || [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        // Limpiar clases previas de estado
        diaElement.classList.remove('disponible', 'parcial', 'no-disponible', 'pasado', 'fin-semana', 'seleccionado');
        
        // Verificar si es un día pasado
        if (fecha < hoy) {
            diaElement.classList.add('pasado');
            return;
        }
    
        // Verificar si es fin de semana
        if ([0, 6].includes(fecha.getDay())) {
            diaElement.classList.add('fin-semana');
            return;
        }
    
        // Marcar como seleccionado si corresponde
        if (fechaStr === hoy.toISOString().split('T')[0]) {
            diaElement.classList.add('seleccionado');
        }
    
        // Calcular horas reservadas al día siguiente
        const fechaSiguiente = new Date(fecha);
        fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);
        const reservasDiaSiguiente = this.reservas[fechaSiguiente.toISOString().split('T')[0]] || [];
        const horasTotales = config.horarioAtencion.fin - config.horarioAtencion.inicio;
        const horasReservadas = reservasDiaSiguiente.length;
    
        // Asignar clase en función del estado de reservas del día siguiente
        if (horasReservadas === 0) {
            diaElement.classList.add('disponible');
        } else if (horasReservadas >= config.capacidadMaxima.porDia) {
            diaElement.classList.add('no-disponible');
        } else {
            diaElement.classList.add('parcial');
        }
    }    

    cambiarMes(delta) {
        const calendario = document.getElementById('calendario');
        const [mes, año] = calendario.querySelector('span').textContent.split(' de ');
        const fecha = new Date(año, this.obtenerNumeroMes(mes) + delta, 1);
        this.renderizarCalendario(fecha.getMonth(), fecha.getFullYear());
    }

    obtenerNumeroMes(nombreMes) {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return meses.indexOf(nombreMes.toLowerCase());
    }

    verificarDisponibilidad(fecha) {
        // Verificar si es un día pasado o fin de semana
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fecha < hoy || fecha.getDay() === 0 || fecha.getDay() === 6) {
            return false;
        }

        const fechaStr = fecha.toISOString().split('T')[0];
        const reservasDia = this.reservas[fechaStr] || [];
        
        // Verificar si hay espacio según la capacidad máxima por día
        return reservasDia.length < config.capacidadMaxima.porDia;
    }

    mostrarHorariosDisponibles(fecha) {
        if (!this.usuarioManager.estaAutenticado()) {
            this.mostrarMensaje('Por favor, inicia sesión para realizar una reserva', 'info');
            return;
        }
    
        const horariosContainer = document.getElementById('horarios-disponibles');
        horariosContainer.innerHTML = '<h3>Horarios Disponibles</h3>';
    
        const fechaStr = fecha.toISOString().split('T')[0];
        const reservasDia = this.obtenerReservasDelDia(fechaStr);
    
        for (let hora = config.horarioAtencion.inicio; hora < config.horarioAtencion.fin; hora++) {
            const horaEstaReservada = this.verificarHoraReservada(hora, reservasDia);
    
            if (!horaEstaReservada) {
                this.crearBotonHoraDisponible(horariosContainer, fecha, hora);
            } else {
                this.crearBotonHoraReservada(horariosContainer, hora);
            }
        }
    }
    
    obtenerReservasDelDia(fechaStr) {
        const reservasDia = this.reservas[fechaStr] || [];
    
        // Consultar reservas adicionales almacenadas en localStorage
        const reservasLocalStorage = JSON.parse(localStorage.getItem('reservas') || '{}');
        return [...reservasDia, ...(reservasLocalStorage[fechaStr] || [])];
    }
    
    verificarHoraReservada(hora, reservasDia) {
        return reservasDia.some(reserva => reserva.hora === hora);
    }
    
    crearBotonHoraDisponible(container, fecha, hora) {
        const boton = document.createElement('button');
        boton.className = 'btn btn-primary';
        boton.textContent = `${hora}:00`;
        boton.setAttribute('data-hora', hora);
        boton.onclick = () => {
            this.realizarReserva(fecha, hora);
            this.actualizarEstadoReserva(fecha, hora, boton);
        };
        container.appendChild(boton);
    }
    
    crearBotonHoraReservada(container, hora) {
        const botonDeshabilitado = document.createElement('button');
        botonDeshabilitado.className = 'btn btn-secondary';
        botonDeshabilitado.disabled = true;
        botonDeshabilitado.textContent = `${hora}:00 - Reservado`;
        container.appendChild(botonDeshabilitado);
    }
    
    actualizarEstadoReserva(fecha, hora, boton) {
        boton.disabled = true;
        boton.className = 'btn btn-secondary';
        boton.textContent = `${hora}:00 - Reservado`;
    
        // Guardar la reserva en localStorage
        const fechaStr = fecha.toISOString().split('T')[0];
        const reservasLocalStorage = JSON.parse(localStorage.getItem('reservas') || '{}');
        if (!reservasLocalStorage[fechaStr]) {
            reservasLocalStorage[fechaStr] = [];
        }
        reservasLocalStorage[fechaStr].push({ hora });
        localStorage.setItem('reservas', JSON.stringify(reservasLocalStorage));
    }
    
    
    
    
    actualizarColoresDias() {
        const dias = document.querySelectorAll('.dia');
    
        dias.forEach(dia => {
            const fecha = dia.getAttribute('data-fecha'); // Asegúrate de tener un atributo data-fecha
            if (!fecha) return;
    
            const reservasDia = this.reservas[fecha] || [];
            if (reservasDia.length === 0) {
                dia.style.backgroundColor = 'green'; // Disponible
            } else if (reservasDia.length < this.horas.length) {
                dia.style.backgroundColor = 'yellow'; // Algunas horas reservadas
            } else {
                dia.style.backgroundColor = 'red'; // Todas las horas reservadas
            }
        });
    }    

    actualizarResumen() {
        const resumen = document.getElementById('resumen-detalles');
    
        if (!this.usuarioManager.estaAutenticado()) {
            resumen.innerHTML = '<p>Por favor, inicia sesión para ver tus reservas.</p>';
            return;
        }
    
        const reservasUsuario = this.obtenerReservasUsuario(this.usuarioManager.usuarioActual);
    
        if (reservasUsuario.length === 0) {
            resumen.innerHTML = '<p>No tienes reservas realizadas.</p>';
            return;
        }
    
        resumen.innerHTML = '<h3>Tus Reservas</h3>';
        const lista = document.createElement('ul');
        lista.className = 'lista-reservas';
    
        reservasUsuario.forEach((reserva) => {
            const fecha = new Date(reserva.hora);
            const fechaStr = fecha.toISOString().split('T')[0];
            const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const horaFormateada = fecha.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
    
            const item = document.createElement('li');
            item.innerHTML = `
                <span>Fecha: ${fechaFormateada}</span>
                <span>Hora: ${horaFormateada}</span>
                <button class="btn btn-danger" 
                    onclick="sistema.cancelarReserva('${fechaStr}', 
                    ${this.obtenerIndiceReserva(fechaStr, reserva)})">
                    Cancelar
                </button>
            `;
            lista.appendChild(item);
        });
    
        resumen.appendChild(lista);
    }

    obtenerIndiceReserva(fechaStr, reserva) {
        return this.reservas[fechaStr].findIndex(r => 
            r.hora === reserva.hora && r.email === reserva.email
        );
    }
    
    cancelarReserva(fecha, index) {
        const fechaObj = new Date(fecha);
        const fechaStr = fechaObj.toISOString().split('T')[0];
        
        if (this.reservas[fechaStr] && this.reservas[fechaStr][index]) {
            // Verificar que la reserva pertenece al usuario actual
            if (this.reservas[fechaStr][index].email !== this.usuarioManager.usuarioActual) {
                this.mostrarMensaje('No tienes permiso para cancelar esta reserva', 'error');
                return;
            }

            // Eliminar la reserva
            this.reservas[fechaStr].splice(index, 1);
            
            // Si no hay más reservas para ese día, eliminar el día
            if (this.reservas[fechaStr].length === 0) {
                delete this.reservas[fechaStr];
            }

            this.guardarReservas();
            this.renderizarCalendario(fechaObj.getMonth(), fechaObj.getFullYear());
            this.actualizarResumen();
            this.mostrarMensaje('Reserva cancelada correctamente', 'success');
        } else {
            this.mostrarMensaje('No se encontró la reserva a cancelar', 'error');
        }
    }

    obtenerReservasUsuario(email) {
        const reservasUsuario = [];
        for (const fecha in this.reservas) {
            if (this.reservas[fecha]) {
                const reservasFecha = this.reservas[fecha].filter(reserva => reserva.email === email);
                reservasFecha.forEach(reserva => {
                    reservasUsuario.push({
                        ...reserva,
                        fecha
                    });
                });
            }
        }
        return reservasUsuario;
    } 

    async realizarReserva(fecha, hora) {
        try {
            if (!this.usuarioManager.estaAutenticado()) {
                throw new Error('Debes iniciar sesión para realizar una reserva');
            }

            const fechaHora = new Date(fecha);
            fechaHora.setHours(hora, 0, 0, 0);
    
            const fechaStr = fechaHora.toISOString().split('T')[0];
            const horaStr = fechaHora.toISOString();
    
            // Inicializar el array de reservas para esta fecha si no existe
            if (!this.reservas[fechaStr]) {
                this.reservas[fechaStr] = [];
            }
    
            // Verificar límite de reservas por día
            if (this.reservas[fechaStr].length >= config.capacidadMaxima.porDia) {
                throw new Error('Se ha alcanzado el límite de reservas para este día');
            }
    
            // Verificar si la hora ya está reservada para este día específico
            const horaYaReservada = this.reservas[fechaStr].some(reserva => {
                const reservaHora = new Date(reserva.hora).getHours();
                return reservaHora === hora;
            });
    
            if (horaYaReservada) {
                throw new Error('La hora seleccionada ya está reservada');
            }
    
            // Agregar la nueva reserva
            this.reservas[fechaStr].push({
                email: this.usuarioManager.usuarioActual,
                hora: horaStr,
                estado: 'confirmada'
            });
    
            this.guardarReservas();
            await this.enviarConfirmacionEmail(this.usuarioManager.usuarioActual, fechaHora);
    
            // Actualizar solo el día específico
            this.mostrarMensaje('Reserva realizada con éxito', 'success');
            this.mostrarHorariosDisponibles(fecha);
            this.actualizarResumen();
            
            // Renderizar el calendario solo para actualizar los colores
            const mesActual = fecha.getMonth();
            const añoActual = fecha.getFullYear();
            this.renderizarCalendario(mesActual, añoActual);
        } catch (error) {
            this.mostrarMensaje(error.message, 'error');
        }
    }

    async enviarConfirmacionEmail(email, fecha) {
        console.log(`Email de confirmación enviado a ${email} para la fecha ${fecha}`);
    }

    guardarReservas() {
        localStorage.setItem('reservas', JSON.stringify(this.reservas));
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        Swal.fire({
            text: mensaje,
            icon: tipo, // 'success', 'error', 'info', 'warning'
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
        });
    }
    
}

// Inicializar el sistema
const sistema = new SistemaReservas();