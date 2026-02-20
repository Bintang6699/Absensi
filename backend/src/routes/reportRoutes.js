const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getClassAttendanceReport, getStudentReportCard } = require('../controllers/reportController');

router.get('/attendance/class', protect, admin, getClassAttendanceReport);
router.get('/student/:id', protect, getStudentReportCard);

module.exports = router;
