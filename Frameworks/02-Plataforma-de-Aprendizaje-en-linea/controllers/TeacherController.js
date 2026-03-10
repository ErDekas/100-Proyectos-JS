const Course = require('../models/Course');
const User = require('../models/User');

// Dashboard del profesor
exports.getDashboard = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.session.user._id });
    const totalStudents = courses.reduce((acc, c) => acc + c.enrollments.length, 0);
    res.render('dashboard/teacher', { title: 'Panel del Profesor', courses, totalStudents });
  } catch (err) {
    req.flash('error', 'Error al cargar el panel');
    res.redirect('/dashboard');
  }
};

// Crear curso - formulario
exports.getCreateCourse = (req, res) => {
  res.render('courses/create', { title: 'Crear Curso' });
};

// Crear curso - guardar
exports.postCreateCourse = async (req, res) => {
  try {
    const { title, description, shortDescription, category, level, language, tags } = req.body;
    const course = await Course.create({
      title, description, shortDescription, category, level, language,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      teacher: req.session.user._id,
      thumbnail: req.file ? req.file.path : '/img/default-course.png'
    });
    req.flash('success', 'Curso creado con éxito');
    res.redirect(`/teacher/courses/${course._id}/edit`);
  } catch (err) {
    req.flash('error', 'Error al crear el curso');
    res.redirect('/teacher/courses/create');
  }
};

// Editar curso
exports.getEditCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id });
    if (!course) { req.flash('error', 'Curso no encontrado'); return res.redirect('/teacher'); }
    res.render('courses/edit', { title: 'Editar Curso', course });
  } catch (err) {
    req.flash('error', 'Error al cargar el curso');
    res.redirect('/teacher');
  }
};

// Actualizar curso
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, shortDescription, category, level, language, tags, published } = req.body;
    const update = { title, description, shortDescription, category, level, language,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      published: published === 'on', updatedAt: new Date() };
    if (req.file) update.thumbnail = req.file.path;
    await Course.findOneAndUpdate({ _id: req.params.id, teacher: req.session.user._id }, update);
    req.flash('success', 'Curso actualizado');
    res.redirect(`/teacher/courses/${req.params.id}/edit`);
  } catch (err) {
    req.flash('error', 'Error al actualizar el curso');
    res.redirect('/teacher');
  }
};

// Añadir sección
exports.addSection = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id });
    if (!course) return res.redirect('/teacher');
    course.sections.push({ title: req.body.title, description: req.body.description, order: course.sections.length });
    await course.save();
    req.flash('success', 'Sección añadida');
    res.redirect(`/teacher/courses/${course._id}/edit`);
  } catch (err) {
    req.flash('error', 'Error al añadir la sección');
    res.redirect('/teacher');
  }
};

// Añadir lección
exports.addLesson = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id });
    if (!course) return res.redirect('/teacher');
    const section = course.sections.find(s => s._id.toString() === req.params.sectionId);
    if (!section) { req.flash('error', 'Sección no encontrada'); return res.redirect(`/teacher/courses/${course._id}/edit`); }

    const { title, type, content, videoUrl, duration } = req.body;
    const lesson = { title, type, content, videoUrl, duration: duration || 0, order: section.lessons.length };
    if (req.file) lesson.fileUrl = req.file.path;
    section.lessons.push(lesson);
    await course.save();
    req.flash('success', 'Lección añadida');
    res.redirect(`/teacher/courses/${course._id}/edit`);
  } catch (err) {
    req.flash('error', 'Error al añadir la lección');
    res.redirect('/teacher');
  }
};

// Crear tarea
exports.addAssignment = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id });
    if (!course) return res.redirect('/teacher');
    const { title, description, dueDate, maxScore } = req.body;
    course.assignments.push({ title, description, dueDate, maxScore: maxScore || 100 });
    await course.save();
    req.flash('success', 'Tarea creada');
    res.redirect(`/teacher/courses/${course._id}/assignments`);
  } catch (err) {
    req.flash('error', 'Error al crear la tarea');
    res.redirect('/teacher');
  }
};

// Ver entregas de una tarea
exports.getSubmissions = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id }).populate('submissions.student', 'name email avatar');
    if (!course) return res.redirect('/teacher');

    // Buscar la tarea comparando strings para evitar fallos de tipo ObjectId
    const assignment = course.assignments.find(a => a._id.toString() === req.params.assignmentId);
    if (!assignment) {
      req.flash('error', 'Tarea no encontrada');
      return res.redirect(`/teacher/courses/${course._id}/assignments`);
    }

    const submissions = course.submissions.filter(s => s.assignment.toString() === req.params.assignmentId);
    res.render('courses/submissions', { title: 'Entregas', course, assignment, submissions });
  } catch (err) {
    req.flash('error', 'Error al cargar entregas');
    res.redirect('/teacher');
  }
};

// Calificar entrega
exports.gradeSubmission = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id });
    if (!course) return res.redirect('/teacher');
    const submission = course.submissions.find(s => s._id.toString() === req.params.submissionId);
    if (submission) {
      submission.score = req.body.score;
      submission.feedback = req.body.feedback;
      submission.graded = true;
      await course.save();
      req.flash('success', 'Entrega calificada');
    }
    res.redirect(`/teacher/courses/${course._id}/assignments/${req.params.assignmentId}/submissions`);
  } catch (err) {
    req.flash('error', 'Error al calificar');
    res.redirect('/teacher');
  }
};

// Ver alumnos del curso
exports.getStudents = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id }).populate('enrollments.student', 'name email avatar');
    if (!course) return res.redirect('/teacher');
    res.render('courses/students', { title: 'Estudiantes', course });
  } catch (err) {
    req.flash('error', 'Error al cargar estudiantes');
    res.redirect('/teacher');
  }
};

// Gestión de tareas
exports.getAssignments = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.session.user._id });
    if (!course) return res.redirect('/teacher');
    res.render('courses/assignments', { title: 'Tareas', course });
  } catch (err) {
    req.flash('error', 'Error al cargar tareas');
    res.redirect('/teacher');
  }
};