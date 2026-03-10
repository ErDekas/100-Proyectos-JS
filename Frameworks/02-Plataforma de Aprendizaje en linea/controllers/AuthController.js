const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../config/email');

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
    if (!user.isVerified) {
      req.flash('error', 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
      return res.redirect('/auth/login');
    }
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified };
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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const assignedRole = role === 'teacher' ? 'teacher' : 'student';
    const user = await User.create({
      name, email, password, role: assignedRole,
      isVerified: false, verificationToken, verificationExpires
    });
    try {
      await sendVerificationEmail(user, verificationToken);
      req.flash('success', `¡Cuenta creada! Hemos enviado un email de verificación a ${email}.`);
    } catch (emailErr) {
      console.error('Error enviando email:', emailErr.message);
      req.flash('success', '¡Cuenta creada! No pudimos enviar el email, puedes solicitarlo de nuevo.');
    }
    res.redirect('/auth/pending-verification');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error al crear la cuenta');
    res.redirect('/auth/register');
  }
};

exports.getPendingVerification = (req, res) => {
  res.render('auth/pending-verification', { title: 'Verifica tu email' });
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }
    });
    if (!user) {
      req.flash('error', 'El enlace de verificación no es válido o ha expirado.');
      return res.redirect('/auth/login');
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: true };
    req.flash('success', '¡Email verificado! Ya puedes matricularte en cursos.');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Error al verificar el email');
    res.redirect('/auth/login');
  }
};

exports.getResendVerification = (req, res) => {
  res.render('auth/resend-verification', { title: 'Reenviar verificación' });
};

exports.postResendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      req.flash('success', 'Si el email existe y no está verificado, recibirás un nuevo enlace.');
      return res.redirect('/auth/pending-verification');
    }
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user, verificationToken);
    req.flash('success', `Nuevo enlace enviado a ${email}.`);
    res.redirect('/auth/pending-verification');
  } catch (err) {
    req.flash('error', 'Error al reenviar el email');
    res.redirect('/auth/resend-verification');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
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