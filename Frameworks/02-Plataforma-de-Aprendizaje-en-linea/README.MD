# 🎓 Plataforma de Aprendizaje en Línea

Proyecto 62/100 del reto **100 Proyectos JS** — Una plataforma educativa estilo Moodle construida con Node.js, Express y MongoDB.

## 🛠️ Tecnologías

- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB + Mongoose
- **Vistas:** EJS (templates)
- **Autenticación:** Express-session + bcryptjs
- **Subida de archivos:** Multer

## ✨ Funcionalidades

### 👤 Roles
- **Admin** — Gestión total de usuarios y cursos
- **Profesor** — Crear y gestionar cursos, tareas y calificaciones
- **Estudiante** — Matricularse, ver lecciones y entregar tareas

### 📚 Cursos
- Secciones y lecciones (texto, video, archivo)
- Seguimiento de progreso automático
- Filtrado por categoría y nivel

### 📝 Tareas
- Entregas con texto y archivos adjuntos
- Calificación y feedback del profesor

### 🔐 Autenticación
- Registro e inicio de sesión
- Perfiles editables con avatar

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tu conexión a MongoDB

# 3. Crear carpeta de uploads
mkdir -p public/uploads

# 4. (Opcional) Cargar datos de prueba
node seed.js

# 5. Iniciar el servidor
npm run dev
```

## 🔑 Usuarios de prueba (tras ejecutar seed.js)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@edulearn.com | admin123 |
| Profesor | profe@edulearn.com | profe123 |
| Estudiante | ana@edulearn.com | ana123 |

## 📁 Estructura del Proyecto

```
├── app.js                # Entrada principal
├── config/               # Funcionamiento del envio de email
├── controllers/          # Lógica de negocio
├── middleware/           # Autenticación y permisos
├── models/               # Esquemas MongoDB
├── public/               # CSS, JS, imágenes
├── routes/               # Definición de rutas
├── views/                # Templates EJS
└── seed.js               # Datos de prueba
```

