require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plataforma-aprendizaje');
  console.log('🔗 Conectado a MongoDB');

  await User.deleteMany({});
  await Course.deleteMany({});

  // Crear usuarios
  const admin = await User.create({ name: 'Administrador', email: 'admin@edulearn.com', password: 'admin123', role: 'admin' });
  const teacher = await User.create({ name: 'Prof. García', email: 'profe@edulearn.com', password: 'profe123', role: 'teacher', bio: 'Desarrollador web con 10 años de experiencia.' });
  const student = await User.create({ name: 'Ana Estudiante', email: 'ana@edulearn.com', password: 'ana123', role: 'student' });

  // Crear curso de ejemplo
  await Course.create({
    title: 'JavaScript desde Cero',
    description: 'Aprende JavaScript desde los fundamentos hasta conceptos avanzados. Este curso está diseñado para principiantes sin experiencia previa en programación.',
    shortDescription: 'El curso más completo de JavaScript para principiantes.',
    category: 'Programación',
    level: 'Principiante',
    language: 'Español',
    teacher: teacher._id,
    published: true,
    tags: ['javascript', 'web', 'programación'],
    sections: [
      {
        title: 'Introducción',
        description: 'Primeros pasos con JavaScript',
        order: 0,
        lessons: [
          { title: '¿Qué es JavaScript?', type: 'text', content: 'JavaScript es el lenguaje de programación de la web. Con él puedes hacer páginas interactivas, aplicaciones web y mucho más.\n\nEn esta lección aprenderás:\n- Historia de JavaScript\n- Por qué aprenderlo\n- Tu primer script', order: 0, duration: 10 },
          { title: 'Configurar el entorno', type: 'text', content: 'Solo necesitas un navegador y un editor de texto. Te recomendamos Visual Studio Code, que es gratuito y muy potente.', order: 1, duration: 5 },
          { title: 'Hola Mundo en JS', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', content: 'En este video verás cómo escribir tu primer programa en JavaScript.', order: 2, duration: 15 }
        ]
      },
      {
        title: 'Variables y Tipos de Datos',
        description: 'Aprende a almacenar y manipular datos',
        order: 1,
        lessons: [
          { title: 'var, let y const', type: 'text', content: 'En JavaScript moderno usamos let y const para declarar variables.\n\nlet x = 5; // variable que puede cambiar\nconst PI = 3.14; // constante que no cambia', order: 0, duration: 12 },
          { title: 'Tipos de datos primitivos', type: 'text', content: 'JavaScript tiene varios tipos de datos: string, number, boolean, null, undefined y symbol.', order: 1, duration: 10 }
        ]
      }
    ],
    assignments: [
      { title: 'Ejercicio 1: Variables', description: 'Crea un programa que declare 3 variables de tipos diferentes y las muestre en consola.', maxScore: 100 }
    ]
  });

  console.log('✅ Seed completado!');
  console.log('');
  console.log('👤 Usuarios creados:');
  console.log('   Admin:    admin@edulearn.com / admin123');
  console.log('   Profesor: profe@edulearn.com / profe123');
  console.log('   Alumno:   ana@edulearn.com   / ana123');

  mongoose.disconnect();
}

seed().catch(console.error);