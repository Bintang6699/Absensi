const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
} = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

// Admin-only: Get all students
router.route('/').get(admin, getStudents);

// Both Admin and Student: Get/Update specific student
// (Controller will handle checking if student is accessing their own data)
router
    .route('/:id')
    .get(getStudentById)
    .put(updateStudent)
    .delete(admin, deleteStudent); // Delete remains admin-only

module.exports = router;
