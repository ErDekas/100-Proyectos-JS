const User = require('../models/User');
const Course = require('../models/Course');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalStudents, totalTeachers] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' })
    ]);
    const recentUsers = await User.find().sort('-createdAt').limit(5);
    const recentCourses = await Course.find().populate('teacher', 'name').sort('-createdAt').limit(5);
    res.render('admin/dashboard', { title: 'Panel de Administración', totalUsers, totalCourses, totalStudents, totalTeachers, recentUsers, recentCourses });
  } catch (err) {
    req.flash('error', 'Error al cargar el panel');
    res.redirect('/dashboard');
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(filter).sort('-createdAt');
    res.render('admin/users', { title: 'Usuarios', users, query: req.query });
  } catch (err) {
    req.flash('error', 'Error al cargar usuarios');
    res.redirect('/admin');
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    req.flash('success', 'Rol actualizado');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Error al actualizar el rol');
    res.redirect('/admin/users');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'Usuario eliminado');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Error al eliminar el usuario');
    res.redirect('/admin/users');
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name email').sort('-createdAt');
    res.render('admin/courses', { title: 'Gestión de Cursos', courses });
  } catch (err) {
    req.flash('error', 'Error al cargar cursos');
    res.redirect('/admin');
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    course.published = !course.published;
    await course.save();
    req.flash('success', `Curso ${course.published ? 'publicado' : 'despublicado'}`);
    res.redirect('/admin/courses');
  } catch (err) {
    req.flash('error', 'Error al cambiar estado del curso');
    res.redirect('/admin/courses');
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    req.flash('success', 'Curso eliminado');
    res.redirect('/admin/courses');
  } catch (err) {
    req.flash('error', 'Error al eliminar el curso');
    res.redirect('/admin/courses');
  }
};