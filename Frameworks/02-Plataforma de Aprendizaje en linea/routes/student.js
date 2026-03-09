const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const studentController = require('../controllers/studentController');
const { isStudent } = require('../middleware/Auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.use(isStudent);

router.get('/', studentController.getDashboard);
router.get('/courses/:id', studentController.getCourse);
router.get('/courses/:id/assignments', studentController.getAssignments);
router.post('/courses/:id/assignments/:assignmentId/submit', upload.single('file'), studentController.submitAssignment);

module.exports = router;