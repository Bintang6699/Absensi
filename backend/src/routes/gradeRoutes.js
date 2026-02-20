const express = require('express');
const router = express.Router();
const {
    addGrade,
    getGradesByStudent,
    getStudentSummary,
} = require('../controllers/gradeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', admin, addGrade);
router.get('/student/:studentId', getGradesByStudent);
// Note: Summary route could also be on studentRoutes, but putting it here or connecting via separate path is fine.
// Actually, `getStudentSummary` is best accessed via `/api/students/:id/summary` or `/api/grades/summary/:id`
router.get('/summary/:id', getStudentSummary);

module.exports = router;
