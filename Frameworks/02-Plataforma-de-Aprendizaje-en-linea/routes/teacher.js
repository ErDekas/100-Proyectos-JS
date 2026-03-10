const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/TeacherController');
const { isTeacher } = require('../middleware/auth');
const { uploadThumbnail, uploadLessonFile } = require('../config/cloudinary');

router.use(isTeacher);

router.get('/', teacherController.getDashboard);
router.get('/courses/create', teacherController.getCreateCourse);
router.post('/courses/create', uploadThumbnail.single('thumbnail'), teacherController.postCreateCourse);
router.get('/courses/:id/edit', teacherController.getEditCourse);
router.put('/courses/:id', uploadThumbnail.single('thumbnail'), teacherController.updateCourse);
router.post('/courses/:id/sections', teacherController.addSection);
router.post('/courses/:id/sections/:sectionId/lessons', uploadLessonFile.single('file'), teacherController.addLesson);
router.get('/courses/:id/assignments', teacherController.getAssignments);
router.post('/courses/:id/assignments', teacherController.addAssignment);
router.get('/courses/:id/assignments/:assignmentId/submissions', teacherController.getSubmissions);
router.post('/courses/:id/submissions/:submissionId/grade', teacherController.gradeSubmission);
router.get('/courses/:id/students', teacherController.getStudents);

module.exports = router;