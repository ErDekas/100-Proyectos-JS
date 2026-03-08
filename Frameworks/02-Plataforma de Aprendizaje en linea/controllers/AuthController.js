const User = require('../models/User');

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Iniciar Sesión' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Email o contraseña incorrectos');
      return res.redirect('/auth/login');
    }
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    req.flash('success', `¡Bienvenido/a, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Error al iniciar sesión');
    res.redirect('/auth/login');
  }
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Crear Cuenta' });
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    if (password !== confirmPassword) {
      req.flash('error', 'Las contraseñas no coinciden');
      return res.redirect('/auth/register');
    }
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'El email ya está registrado');
      return res.redirect('/auth/register');
    }
    // Solo admin puede crear admins
    const assignedRole = role === 'teacher' ? 'teacher' : 'student';
    const user = await User.create({ name, email, password, role: assignedRole });
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    req.flash('success', '¡Cuenta creada con éxito!');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Error al crear la cuenta');
    res.redirect('/auth/register');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render('auth/profile', { title: 'Mi Perfil', profileUser: user });
  } catch (err) {
    req.flash('error', 'Error al cargar el perfil');
    res.redirect('/dashboard');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const update = { name, bio };
    if (req.file) update.avatar = '/uploads/' + req.file.filename;
    const user = await User.findByIdAndUpdate(req.session.user._id, update, { new: true });
    req.session.user.name = user.name;
    req.session.user.avatar = user.avatar;
    req.flash('success', 'Perfil actualizado');
    res.redirect('/auth/profile');
  } catch (err) {
    req.flash('error', 'Error al actualizar el perfil');
    res.redirect('/auth/profile');
  }
};