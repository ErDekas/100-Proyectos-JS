const express = require('express');
const router = express.Router();
const courseController = require('../controllers/CourseController');
const { isAuthenticated } = require('../middleware/Auth');

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);
router.post('/:id/enroll', isAuthenticated, courseController.enroll);
router.get('/:courseId/lessons/:lessonId', isAuthenticated, courseController.getLesson);

module.exports = router;