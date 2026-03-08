const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  req.flash('error', 'Debes iniciar sesión para acceder');
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'No tienes permisos de administrador');
  res.redirect('/dashboard');
};

const isTeacher = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'teacher' || req.session.user.role === 'admin')) return next();
  req.flash('error', 'No tienes permisos de profesor');
  res.redirect('/dashboard');
};

const isStudent = (req, res, next) => {
  if (req.session.user) return next();
  req.flash('error', 'Debes iniciar sesión');
  res.redirect('/auth/login');
};

const isGuest = (req, res, next) => {
  if (!req.session.user) return next();
  res.redirect('/dashboard');
};

module.exports = { isAuthenticated, isAdmin, isTeacher, isStudent, isGuest };