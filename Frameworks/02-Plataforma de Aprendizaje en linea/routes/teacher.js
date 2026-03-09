const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const teacherController = require('../controllers/teacherController');
const { isTeacher } = require('../middleware/Auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.use(isTeacher);

router.get('/', teacherController.getDashboard);
router.get('/courses/create', teacherController.getCreateCourse);
router.post('/courses/create', upload.single('thumbnail'), teacherController.postCreateCourse);
router.get('/courses/:id/edit', teacherController.getEditCourse);
router.put('/courses/:id', upload.single('thumbnail'), teacherController.updateCourse);
router.post('/courses/:id/sections', teacherController.addSection);
router.post('/courses/:id/sections/:sectionId/lessons', upload.single('file'), teacherController.addLesson);
router.get('/courses/:id/assignments', teacherController.getAssignments);
router.post('/courses/:id/assignments', teacherController.addAssignment);
router.get('/courses/:id/assignments/:assignmentId/submissions', teacherController.getSubmissions);
router.post('/courses/:id/submissions/:submissionId/grade', teacherController.gradeSubmission);
router.get('/courses/:id/students', teacherController.getStudents);

module.exports = router;