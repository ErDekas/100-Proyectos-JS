const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isStudent } = require('../middleware/auth');
const { uploadSubmission } = require('../config/cloudinary');

router.use(isStudent);

router.get('/', studentController.getDashboard);
router.get('/courses/:id', studentController.getCourse);
router.get('/courses/:id/assignments', studentController.getAssignments);
router.post('/courses/:id/assignments/:assignmentId/submit', uploadSubmission.single('file'), studentController.submitAssignment);

module.exports = router;