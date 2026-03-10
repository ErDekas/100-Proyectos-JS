const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

router.use(isAdmin);

router.get('/', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/courses', adminController.getCourses);
router.put('/courses/:id/toggle-publish', adminController.togglePublish);
router.delete('/courses/:id', adminController.deleteCourse);

module.exports = router;