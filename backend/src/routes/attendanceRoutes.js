const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendanceByStudent,
    getAttendanceByClass,
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(admin, markAttendance);
router.get('/class', admin, getAttendanceByClass);
router.get('/student/:studentId', getAttendanceByStudent);

module.exports = router;
