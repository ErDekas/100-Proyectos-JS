const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/AuthController');
const { isAuthenticated, isGuest } = require('../middleware/Auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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
router.post('/profile', isAuthenticated, upload.single('avatar'), authController.updateProfile);

module.exports = router;