const Course = require('../models/Course');
const User = require('../models/User');

// Dashboard del estudiante
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('enrolledCourses');
    const enrolledCourses = await Course.find({ 'enrollments.student': req.session.user._id }).populate('teacher', 'name');

    const coursesWithProgress = enrolledCourses.map(course => {
      const enrollment = course.enrollments.find(e => e.student.toString() === req.session.user._id.toString());
      return { course, progress: enrollment ? enrollment.progress : 0 };
    });
    res.render('dashboard/student', { title: 'Mi Aprendizaje', coursesWithProgress });
  } catch (err) {
    req.flash('error', 'Error al cargar el panel');
    res.redirect('/dashboard');
  }
};

// Ver curso del estudiante (temario)
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name avatar');
    if (!course) return res.redirect('/courses');
    const enrollment = course.enrollments.find(e => e.student.toString() === req.session.user._id.toString());
    if (!enrollment) { req.flash('error', 'No estás matriculado en este curso'); return res.redirect(`/courses/${course._id}`); }
    res.render('dashboard/course-student', { title: course.title, course, enrollment });
  } catch (err) {
    req.flash('error', 'Error al cargar el curso');
    res.redirect('/dashboard');
  }
};

// Ver tareas del curso
exports.getAssignments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.redirect('/dashboard');
    const enrollment = course.enrollments.find(e => e.student.toString() === req.session.user._id.toString());
    if (!enrollment) return res.redirect(`/courses/${course._id}`);

    const assignmentsWithSubmissions = course.assignments.map(assignment => {
      const submission = course.submissions.find(
        s => s.assignment.toString() === assignment._id.toString() && s.student.toString() === req.session.user._id.toString()
      );
      return { assignment, submission };
    });
    res.render('dashboard/assignments-student', { title: 'Mis Tareas', course, assignmentsWithSubmissions });
  } catch (err) {
    req.flash('error', 'Error al cargar tareas');
    res.redirect('/dashboard');
  }
};

// Entregar tarea
exports.submitAssignment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.redirect('/dashboard');

    const existing = course.submissions.find(
      s => s.assignment.toString() === req.params.assignmentId && s.student.toString() === req.session.user._id.toString()
    );
    if (existing) { req.flash('error', 'Ya has entregado esta tarea'); return res.redirect(`/student/courses/${course._id}/assignments`); }

    const submission = { student: req.session.user._id, assignment: req.params.assignmentId, content: req.body.content };
    if (req.file) submission.fileUrl = req.file.path;
    course.submissions.push(submission);
    await course.save();
    req.flash('success', 'Tarea entregada con éxito');
    res.redirect(`/student/courses/${course._id}/assignments`);
  } catch (err) {
    req.flash('error', 'Error al entregar la tarea');
    res.redirect('/dashboard');
  }
};