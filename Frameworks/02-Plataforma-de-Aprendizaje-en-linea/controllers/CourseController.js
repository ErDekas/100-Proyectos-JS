const Course = require('../models/Course');
const User = require('../models/User');

// Listar todos los cursos publicados
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let filter = { published: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter).populate('teacher', 'name avatar').sort('-createdAt');
    const categories = await Course.distinct('category');
    res.render('courses/index', { title: 'Cursos', courses, categories, query: req.query });
  } catch (err) {
    req.flash('error', 'Error al cargar los cursos');
    res.redirect('/');
  }
};

// Ver detalle de curso
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name avatar bio');
    if (!course) { req.flash('error', 'Curso no encontrado'); return res.redirect('/courses'); }

    let isEnrolled = false;
    let enrollment = null;
    if (req.session.user) {
      enrollment = course.enrollments.find(e => e.student.toString() === req.session.user._id.toString());
      isEnrolled = !!enrollment;
    }
    res.render('courses/show', { title: course.title, course, isEnrolled, enrollment });
  } catch (err) {
    req.flash('error', 'Error al cargar el curso');
    res.redirect('/courses');
  }
};

// Matricularse en un curso
exports.enroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) { req.flash('error', 'Curso no encontrado'); return res.redirect('/courses'); }

    // Bloquear matrícula si el email no está verificado
    if (!req.session.user.isVerified) {
      req.flash('error', 'Debes verificar tu email para poder matricularte en cursos.');
      return res.redirect(`/courses/${course._id}`);
    }

    const alreadyEnrolled = course.enrollments.find(e => e.student.toString() === req.session.user._id.toString());
    if (alreadyEnrolled) { req.flash('error', 'Ya estás matriculado en este curso'); return res.redirect(`/courses/${course._id}`); }

    course.enrollments.push({ student: req.session.user._id });
    await course.save();
    await User.findByIdAndUpdate(req.session.user._id, { $push: { enrolledCourses: course._id } });
    req.flash('success', `¡Te has matriculado en ${course.title}!`);
    res.redirect(`/student/courses/${course._id}`);
  } catch (err) {
    req.flash('error', 'Error al matricularse');
    res.redirect('/courses');
  }
};

// Ver lección
exports.getLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('teacher', 'name');
    if (!course) return res.redirect('/courses');

    const enrollment = course.enrollments.find(e => e.student.toString() === req.session.user._id.toString());
    if (!enrollment) { req.flash('error', 'No estás matriculado en este curso'); return res.redirect(`/courses/${course._id}`); }

    let lesson = null;
    let section = null;
    for (const sec of course.sections) {
      const found = sec.lessons.id(req.params.lessonId);
      if (found) { lesson = found; section = sec; break; }
    }
    if (!lesson) { req.flash('error', 'Lección no encontrada'); return res.redirect(`/student/courses/${course._id}`); }

    // Marcar como completada
    if (!enrollment.completedLessons.includes(lesson._id.toString())) {
      enrollment.completedLessons.push(lesson._id);
      const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      await course.save();
    }

    res.render('courses/lesson', { title: lesson.title, course, section, lesson, enrollment });
  } catch (err) {
    req.flash('error', 'Error al cargar la lección');
    res.redirect('/dashboard');
  }
};