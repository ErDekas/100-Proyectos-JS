const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/', async (req, res) => {
  try {
    const featuredCourses = await Course.find({ published: true }).populate('teacher', 'name avatar').sort('-createdAt').limit(6);
    res.render('index', { title: 'EduLearn - Plataforma de Aprendizaje', featuredCourses });
  } catch (err) {
    res.render('index', { title: 'EduLearn', featuredCourses: [] });
  }
});

router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const role = req.session.user.role;
  if (role === 'admin') return res.redirect('/admin');
  if (role === 'teacher') return res.redirect('/teacher');
  res.redirect('/student');
});

module.exports = router;