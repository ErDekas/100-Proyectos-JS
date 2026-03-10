const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/Auth');
const { uploadAvatar } = require('../config/cloudinary');

router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, authController.postLogin);
router.get('/register', isGuest, authController.getRegister);
router.post('/register', isGuest, authController.postRegister);
router.get('/logout', authController.logout);
router.get('/pending-verification', authController.getPendingVerification);
router.get('/verify/:token', authController.verifyEmail);
router.get('/resend-verification', authController.getResendVerification);
router.post('/resend-verification', authController.postResendVerification);
router.get('/profile', isAuthenticated, authController.getProfile);
router.post('/profile', isAuthenticated, uploadAvatar.single('avatar'), authController.updateProfile);

module.exports = router;