// ─── AUTHOR ──────────────────────────────────────────────
export const author = {
  name:     'Pablo Linares López',
  alias:    'Deka',
  age:      20,
  from:     'Granada',
  location: 'Jaén',
  role:     'Desarrollador Web · Estudiante de Ingeniería Informática',
  email:    'pabletor0505@gmail.com',
  // Para añadir tu foto:
  //   1. Mete tu imagen en la carpeta /public/assets/ del proyecto
  //   2. Cambia null por la ruta: '/assets/tu-foto.jpg'
  photo: 'assets/yo.jpg',
  bio: `"Mi sueño es crear videojuegos capaces de revolucionar la industria.
        Todo empezó con Pokémon, se consolidó con Sword Art Online,
        y desde entonces no he parado de programar."`,
  about: [
    `Tengo 20 años, soy de Granada aunque actualmente vivo en Jaén, y la programación entró en mi vida de la forma más inesperada: jugando videojuegos y viendo anime. Sword Art Online y Pokémon no solo me entretenían, me hacían preguntarme cómo se construyen esos mundos.`,
    `Hice el Grado Superior de Desarrollo de Aplicaciones Web y ahora curso Ingeniería Informática. Pero mi universidad real han sido estos 100 proyectos en JavaScript: dos años construyendo, rompiendo y volviendo a construir desde cero.`,
    `Este blog es mi bitácora de ese viaje. Aquí documento lo que aprendo, lo que falla, lo que por fin hace clic, y el camino hacia ese gran proyecto que llevo en la cabeza desde el principio.`
  ],
  hobbies:  ['Videojuegos', 'Anime', 'Amigos', 'Programar'],
  skills:   ['HTML / CSS', 'JavaScript', 'Vue.js 3', 'Node.js', 'APIs REST', 'Git'],
}

// ─── STATS ───────────────────────────────────────────────
export const stats = [
  { num: '61',  label: 'Proyectos completados' },
  { num: '2',   label: 'Años de práctica' },
  { num: '39',  label: 'Proyectos restantes' },
]

// ─── SOCIAL LINKS ────────────────────────────────────────
export const socialLinks = [
  { icon: '◈', label: 'GitHub',    url: 'https://github.com/ErDekas' },
  { icon: '◉', label: 'Instagram', url: 'https://www.instagram.com/tudekas' },
  { icon: '◌', label: 'Email',     url: 'mailto:pabletor0505@gmail.com' },
]

// ─── ARTICLES ────────────────────────────────────────────
export const articles = [
  {
    id: 1,
    category: 'Reflexión',
    title: 'Por qué empecé a programar: SAO, Pokémon y un sueño imposible',
    excerpt: 'Hay quien empieza a programar por dinero, por trabajo o por moda. Yo empecé porque quería crear mundos como los que me quitaban el sueño de pequeño. Esta es esa historia.',
    date: '6 Mar 2026',
    readTime: '7 min',
    featured: true,
    content: [
      {
        type: 'paragraph',
        text: 'Tenía unos diez años cuando me enganché a Pokémon Esmeralda. Pasaba horas intentando completar la Pokédex, optimizando EVs sin saber que eran EVs, leyendo guías en Pokémon Master. Y en algún momento me pregunté: ¿cómo funciona esto por dentro? ¿Quién decidió que un Ralts tiene un 4% de aparición? ¿Cómo calcula el juego si un movimiento acierta o falla?'
      },
      {
        type: 'heading',
        text: 'El anime que lo cambió todo'
      },
      {
        type: 'paragraph',
        text: 'Años después llegó Sword Art Online. Ver a Kirito atrapado en un mundo digital con sus propias físicas, su economía, sus reglas... algo hizo clic de verdad. No quería solo jugar esos mundos. Quería entender cómo se construyen. Y eventualmente, construir uno propio.'
      },
      {
        type: 'heading',
        text: 'Del DAW a los 100 proyectos'
      },
      {
        type: 'paragraph',
        text: 'El Grado Superior de DAW me dio la base técnica: HTML, CSS, JavaScript, algo de PHP y bases de datos. Pero cuando terminé sentí que sabía hacer cosas sin entender del todo por qué funcionaban. Así nació la idea del reto: 100 proyectos en JS, de menor a mayor complejidad, sin saltar pasos. Dos años después estoy en el #61, con Vue.js en las manos por primera vez, y el sueño original más presente que nunca.'
      },
      {
        type: 'quote',
        text: 'No aprendes a programar estudiando programación. Aprendes construyendo cosas que al principio no sabes cómo construir.'
      },
    ]
  },
  {
    id: 2,
    category: 'Retrospectiva',
    title: 'De la Calculadora al Juego de Ajedrez: lo que aprendí en los primeros 60 proyectos',
    excerpt: 'Empecé con una calculadora simple. Terminé el nivel básico con un simulador de clima usando una API real. Aquí está el mapa real de esa evolución, proyecto a proyecto.',
    date: '5 Mar 2026',
    readTime: '9 min',
    featured: false,
    content: [
      {
        type: 'paragraph',
        text: 'El proyecto #1 fue una Calculadora Simple. Cuatro operaciones, un display, algo de CSS. Lo terminé en una tarde. El proyecto #20 fue un Simulador de Clima usando la API de OpenWeatherMap, con geolocalización, iconos dinámicos y manejo de errores. El salto entre ambos no fue solo técnico, fue mental.'
      },
      {
        type: 'heading',
        text: 'El nivel básico: construir los cimientos'
      },
      {
        type: 'paragraph',
        text: 'Los primeros 20 proyectos (Calculadora, Reloj Digital, Lista de Tareas, Galería de Imágenes, Generador de Contraseñas...) parecen simples desde fuera. Por dentro son donde aprendes a manipular el DOM de verdad, a escuchar eventos, a manejar el estado de una interfaz sin ningún framework que te ayude. El Validador de Formulario del proyecto #14, por ejemplo, me enseñó más sobre JavaScript que cualquier tutorial.'
      },
      {
        type: 'heading',
        text: 'El nivel intermedio: cuando las cosas se complican'
      },
      {
        type: 'paragraph',
        text: 'En los proyectos del 21 al 40 llegaron los retos reales. El Editor de Notas con Markdown (#22) me obligó a entender cómo parsear texto en tiempo real. El Tablero de Ajedrez Interactivo (#25) fue el más complejo hasta ese momento: lógica de piezas, validación de movimientos, detección de jaque. El Juego de Sudoku (#39) me tuvo tres días bloqueado con el algoritmo de resolución.'
      },
      {
        type: 'heading',
        text: 'El nivel avanzado: Tetris, autenticación y tiempo real'
      },
      {
        type: 'paragraph',
        text: 'Los proyectos del 41 al 60 fueron donde la cosa se puso seria. El Juego de Tetris (#41) con colisiones y rotaciones de piezas. El Sistema de Autenticación (#42) con registro e inicio de sesión. El Chat en Tiempo Real (#44) con WebSockets. El Simulador de Vuelo con Three.js (#46). Cada uno de estos proyectos me exigió investigar tecnologías que no había tocado antes.'
      },
      {
        type: 'quote',
        text: 'Cada proyecto que parecía imposible al empezarlo acabó siendo el que más me enseñó. El bloqueo es parte del proceso, no un obstáculo.'
      },
    ]
  },
  {
    id: 3,
    category: 'JavaScript',
    title: 'Cómo construir un Chat en Tiempo Real cambió mi forma de entender JavaScript',
    excerpt: 'El proyecto #44 fue el más difícil hasta ese momento. WebSockets, eventos asíncronos, múltiples clientes conectados a la vez. Aquí cuento cómo lo resolví y qué aprendí.',
    date: '28 Feb 2026',
    readTime: '6 min',
    featured: false,
    content: [
      {
        type: 'paragraph',
        text: 'Cuando llegué al proyecto #44 (Chat en Tiempo Real) sabía que iba a ser diferente. Hasta ese punto, todos mis proyectos funcionaban en el cliente. El servidor era algo abstracto, una API que consumía. Aquí tenía que construir los dos lados a la vez y hacer que hablaran entre sí en tiempo real.'
      },
      {
        type: 'heading',
        text: 'El primer problema: el modelo mental'
      },
      {
        type: 'paragraph',
        text: 'Con HTTP estás acostumbrado a: el cliente pide, el servidor responde, fin. Con WebSockets la conexión se mantiene abierta y cualquiera de los dos puede enviar mensajes en cualquier momento. Ese cambio de modelo es más difícil de interiorizar de lo que parece. Las primeras horas las pasé depurando por qué los mensajes llegaban duplicados, o por qué un cliente no recibía lo que enviaba otro.'
      },
      {
        type: 'heading',
        text: 'Lo que de verdad aprendí'
      },
      {
        type: 'paragraph',
        text: 'Más allá de los WebSockets, el chat me obligó a pensar en la sincronización de estado entre múltiples clientes. Si un usuario entra tarde, ¿ve el historial? ¿Cómo evito que los mensajes lleguen desordenados? Estas preguntas no tienen respuesta en ningún tutorial básico. Hay que pensarlas y probarlas.'
      },
      {
        type: 'quote',
        text: 'Los proyectos que más te enseñan son los que te obligan a hacerte preguntas que todavía no sabes responder.'
      },
      {
        type: 'paragraph',
        text: 'El chat quedó funcional, con salas, nicknames y persistencia básica del historial. No es producción, pero cada línea de código la entiendo. Y eso, en este reto, es lo que cuenta.'
      },
    ]
  },
  {
    id: 4,
    category: 'Three.js',
    title: 'Simulador de Vuelo en el navegador: mi primer contacto con Three.js',
    excerpt: 'El proyecto #46 fue construir un simulador de vuelo usando Three.js. Nunca había tocado gráficos 3D. Aquí cuento cómo sobreviví al intento.',
    date: '20 Feb 2026',
    readTime: '7 min',
    featured: false,
    content: [
      {
        type: 'paragraph',
        text: 'Three.js apareció en mi lista de proyectos y lo miré con respeto durante semanas. Gráficos 3D en el navegador sonaba a territorio de gente que sabe lo que hace. Hasta que me di cuenta de que la única forma de llegar a saber lo que haces es hacer cosas sin saber lo que haces.'
      },
      {
        type: 'heading',
        text: 'La curva de aprendizaje de Three.js'
      },
      {
        type: 'paragraph',
        text: 'Los primeros conceptos que tienes que entender son: Scene (el mundo), Camera (tu punto de vista), Renderer (quien dibuja todo), y el game loop con requestAnimationFrame. Una vez que ese esquema mental está claro, el resto empieza a encajar. Geometrías, materiales, luces, sombras: todo son piezas del mismo puzzle.'
      },
      {
        type: 'heading',
        text: 'Lo más difícil: el movimiento en 3D'
      },
      {
        type: 'paragraph',
        text: 'Mover un avión en 3D no es como mover un div en 2D. Tienes tres ejes, rotaciones que se combinan (quaternions), y una cámara que tiene que seguir al objeto de forma natural. Aquí fue donde más tiempo invertí: en conseguir que el vuelo se sintiera fluido y no como mover una caja por el espacio.'
      },
      {
        type: 'quote',
        text: 'Three.js es de esas tecnologías que parece magia hasta que entiendes sus tres conceptos base. Luego todo fluye.'
      },
      {
        type: 'paragraph',
        text: 'El resultado fue un simulador básico pero funcional: un avión que responde a los controles del teclado, con terreno generado proceduralmente y una cámara en tercera persona. No es Microsoft Flight Simulator, pero lo construí yo, y eso me acerca un paso más al tipo de proyectos que quiero hacer.'
      },
    ]
  },
  {
    id: 5,
    category: 'Proceso',
    title: 'Cómo organizo el reto de 100 proyectos mientras estudio Ingeniería Informática',
    excerpt: 'Compaginar la carrera con un reto personal de programación no es fácil. Aquí está mi sistema real: cómo planifico, cómo gestiono los bloqueos y qué hago cuando no tengo tiempo.',
    date: '12 Feb 2026',
    readTime: '5 min',
    featured: false,
    content: [
      {
        type: 'paragraph',
        text: 'La pregunta más habitual cuando cuento el reto es: "¿y cuándo estudias para la carrera?". La respuesta honesta es que los compagino bastante mal, pero los compagino. La carrera va primero cuando hay exámenes. El reto va primero cuando no los hay. Y en medio hay semanas donde ni una cosa ni la otra salen bien.'
      },
      {
        type: 'heading',
        text: 'El sistema que uso'
      },
      {
        type: 'paragraph',
        text: 'Cada proyecto tiene su propia carpeta en el repositorio de GitHub con un README que incluye: objetivo, tecnologías usadas, lo que aprendí y lo que mejoraría. Eso me obliga a cerrar cada proyecto de verdad antes de pasar al siguiente. Sin ese cierre, es fácil tener diez proyectos al 80% y ninguno terminado.'
      },
      {
        type: 'heading',
        text: 'Los bloqueos y cómo salgo de ellos'
      },
      {
        type: 'paragraph',
        text: 'Hay proyectos que se atracan. El Sudoku se atrancó tres días. El Chat se atrancó casi una semana. Mi regla: si llevo más de dos horas en el mismo punto sin avanzar, paro, salgo, vuelvo al día siguiente. El 80% de los bloqueos se resuelven solos después de una noche de sueño. El 20% restante los resuelve documentación, StackOverflow, o hacer preguntas en foros.'
      },
      {
        type: 'quote',
        text: 'La constancia no es no parar nunca. Es siempre volver.'
      },
    ]
  },
  {
    id: 6,
    category: 'Vue.js',
    title: 'Del HTML puro a Vue 3: lo que nadie te explica del salto a frameworks',
    excerpt: 'Después de 60 proyectos en vanilla JS, llega el momento de los frameworks. El cambio mental que necesitas no es el que te esperas.',
    date: '6 Mar 2026',
    readTime: '6 min',
    featured: false,
    content: [
      {
        type: 'paragraph',
        text: 'Durante 60 proyectos me negué conscientemente a usar frameworks. La razón era simple: quería entender qué hace el DOM, cómo funciona el estado sin ninguna capa de abstracción, por qué el código espagueti duele. Ahora que doy el salto a Vue 3, entiendo por qué esa base importa.'
      },
      {
        type: 'heading',
        text: 'El cambio mental principal'
      },
      {
        type: 'paragraph',
        text: 'En vanilla JS piensas en elementos: "agarro este div, le cambio el texto, escucho este click". En Vue piensas en estado: "este dato cambia, y la UI se actualiza sola". Ese es el giro de 180 grados que necesitas. No es técnicamente difícil si vienes con base, pero hasta que lo internalizas, Vue parece más magia de lo que es.'
      },
      {
        type: 'heading',
        text: 'Por qué Vue antes que React'
      },
      {
        type: 'paragraph',
        text: 'Tengo seis proyectos con React en mi hoja de ruta. Elegí Vue primero porque su sintaxis está más cerca del HTML que ya domino, y la Composition API de Vue 3 enseña los mismos conceptos reactivos que después voy a usar en React y en el resto de frameworks. Es como aprender los fundamentos del boxeo antes de hacer MMA.'
      },
      {
        type: 'quote',
        text: 'Vue no te oculta lo que pasa. Te lo muestra de forma ordenada. Eso, cuando vienes de 60 proyectos en vanilla JS, es exactamente lo que necesitas para el salto.'
      },
    ]
  },
]
