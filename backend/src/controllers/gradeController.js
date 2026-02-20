const asyncHandler = require('express-async-handler');
const Grade = require('../models/gradeModel');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');

// @desc    Add a grade
// @route   POST /api/grades
// @access  Private/Admin
const addGrade = asyncHandler(async (req, res) => {
    const { studentId, title, subject, type, score, date, feedback } = req.body;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }

    const grade = await Grade.create({
        student: studentId,
        title,
        subject: subject || 'General',
        type,
        score,
        date: date || Date.now(),
        feedback,
    });

    res.status(201).json(grade);
});

// @desc    Get grades by student
// @route   GET /api/grades/:studentId
// @access  Private (Admin/Student own data)
const getGradesByStudent = asyncHandler(async (req, res) => {
    const studentId = req.params.studentId;

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const grades = await Grade.find({ student: studentId }).sort({ date: -1 });

    res.json(grades);
});

// @desc    Get student summary (Stats)
// @route   GET /api/students/:id/summary
// @access  Private
const getStudentSummary = asyncHandler(async (req, res) => {
    const studentId = req.params.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Fetch student details for header
    const student = await User.findById(studentId);

    // 1. Calculate Grades
    const grades = await Grade.find({ student: studentId });
    const totalScore = grades.reduce((acc, item) => acc + item.score, 0);
    const averageScore = grades.length > 0 ? (totalScore / grades.length).toFixed(1) : 0;

    // 2. Calculate Attendance
    const attendance = await Attendance.find({ student: studentId });
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // 3. Evaluation logic
    let evaluation = 'Baik';
    if (averageScore < 60 || attendancePercentage < 50) {
        evaluation = 'Perlu Lebih Rajin';
    } else if (averageScore < 75) {
        evaluation = 'Cukup';
    } else if (averageScore > 90) {
        evaluation = 'Sangat Baik';
    }

    // If we want manual manual evaluation from User model (if added):
    evaluation = student.manualEvaluation || evaluation;

    // 4. Calculate Monthly Attendance
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};

    attendance.forEach(a => {
        const d = new Date(a.date);
        const monthIndex = d.getMonth();
        const monthName = months[monthIndex];

        if (!monthlyData[monthName]) {
            monthlyData[monthName] = { name: monthName, present: 0, absent: 0 };
        }

        if (a.status === 'Present') {
            monthlyData[monthName].present++;
        } else {
            monthlyData[monthName].absent++;
        }
    });

    // Sort by month index if needed, or just return as is (Recharts handles it)
    const monthlyAttendance = months.map(m => monthlyData[m] || { name: m, present: 0, absent: 0 });

    // 5. Calculate Subject Averages
    const subjectGroups = {};
    grades.forEach(g => {
        const sub = g.subject || 'General';
        if (!subjectGroups[sub]) {
            subjectGroups[sub] = { total: 0, count: 0 };
        }
        subjectGroups[sub].total += g.score;
        subjectGroups[sub].count++;
    });

    const subjectAverages = Object.keys(subjectGroups).map(sub => ({
        subject: sub,
        average: Math.round(subjectGroups[sub].total / subjectGroups[sub].count),
        fullMark: 100
    }));

    res.json({
        student: {
            name: student.name,
            classLevel: student.classLevel,
            address: student.biodata?.address || '-',
        },
        totalScore,
        averageScore,
        attendancePercentage,
        attendanceCount: {
            total: totalDays,
            present: presentDays,
            absent: totalDays - presentDays
        },
        evaluation,
        gradeCount: grades.length,
        // Data for Charts
        gradesList: grades.map(g => ({
            title: g.title,
            score: g.score,
            date: new Date(g.date).toLocaleDateString()
        })),
        attendanceChart: [
            { name: 'Hadir', value: presentDays, color: '#10B981' }, // Green
            { name: 'Absen/Sakit/Izin', value: totalDays - presentDays, color: '#EF4444' } // Red
        ],
        monthlyAttendance,
        subjectAverages
    });
});

module.exports = {
    addGrade,
    getGradesByStudent,
    getStudentSummary
};
