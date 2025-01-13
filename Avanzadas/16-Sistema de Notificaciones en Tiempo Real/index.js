class CrossPlatformNotificationSystem {
    constructor() {
      this.platform = this.detectPlatform();
      this.checkPermission();
    }
  
    // Detectar sistema operativo
    detectPlatform() {
      const platform = navigator.platform.toLowerCase();
      if (platform.includes('win')) return 'windows';
      if (platform.includes('linux')) return 'linux';
      return 'other';
    }
  
    // Verificar y solicitar permisos
    async checkPermission() {
      if (!("Notification" in window)) {
        console.error("Este navegador no soporta notificaciones de escritorio");
        return false;
      }
  
      if (Notification.permission === "granted") {
        return true;
      }
  
      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
  
      return false;
    }
  
    // Configurar opciones según la plataforma
    getPlatformSpecificOptions(options) {
      const baseOptions = {
        body: options.message,
        icon: options.icon,
        tag: Date.now().toString(),
        requireInteraction: true,
        silent: false
      };
  
      if (this.platform === 'linux') {
        return {
          ...baseOptions,
          // Opciones específicas para Linux
          actions: options.actions || [], // Botones de acción en la notificación
          urgency: options.urgency || 'normal', // low, normal, critical
          category: options.category || 'im.received', // Categoría de la notificación
          // Las categorías comunes en Linux son:
          // - im.received (mensaje)
          // - email.arrived (correo)
          // - device.added (dispositivo)
          // - transfer.complete (transferencia)
        };
      }
  
      if (this.platform === 'windows') {
        return {
          ...baseOptions,
          // Opciones específicas para Windows
          badge: options.badge || null,
          image: options.image || null // Imagen grande en la notificación
        };
      }
  
      return baseOptions;
    }
  
    // Mostrar notificación
    async show(options) {
      const hasPermission = await this.checkPermission();
      
      if (!hasPermission) {
        console.warn("No hay permisos para mostrar notificaciones");
        return;
      }
  
      const notificationOptions = this.getPlatformSpecificOptions(options);
      
      const notification = new Notification(options.title, notificationOptions);
  
      // Manejadores de eventos
      if (options.onClick) {
        notification.onclick = options.onClick;
      }
  
      // En Linux, manejar las acciones personalizadas
      if (this.platform === 'linux' && options.actions) {
        notification.onaction = (event) => {
          const action = options.actions.find(a => a.action === event.action);
          if (action && action.handler) {
            action.handler();
          }
        };
      }
  
      notification.onshow = () => {
        console.log(`Notificación mostrada en ${this.platform}`);
        if (options.onShow) options.onShow();
      };
  
      notification.onclose = () => {
        console.log('Notificación cerrada');
        if (options.onClose) options.onClose();
      };
  
      notification.onerror = (err) => {
        console.error('Error en notificación:', err);
        if (options.onError) options.onError(err);
      };
  
      return notification;
    }
  }
  
  // Exportamos la instancia para su uso
  const notifications = new CrossPlatformNotificationSystem();

  // Notificación básica (funciona en ambas plataformas)
notifications.show({
    title: "Nuevo mensaje",
    message: "Tienes un mensaje nuevo de Juan",
    icon: "/path/to/icon.png"
  });
  
  // Notificación específica para Linux con acciones
  notifications.show({
    title: "Nueva actualización",
    message: "Hay una actualización disponible",
    icon: "/path/to/icon.png",
    urgency: "normal",
    category: "software.update",
    actions: [
      {
        action: 'update',
        title: 'Actualizar ahora',
        handler: () => console.log('Iniciando actualización...')
      },
      {
        action: 'later',
        title: 'Más tarde',
        handler: () => console.log('Actualización pospuesta')
      }
    ]
  });
  
  // Notificación con imagen (mejor visualización en Windows)
  notifications.show({
    title: "Nueva foto compartida",
    message: "Juan ha compartido una foto contigo",
    icon: "/path/to/icon.png",
    image: "/path/to/preview.jpg",
    onClick: () => {
      window.focus();
      // Abrir la foto
    }
  });