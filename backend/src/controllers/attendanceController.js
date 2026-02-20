const asyncHandler = require('express-async-handler');
const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');

// @desc    Mark attendance for a student
// @route   POST /api/attendance
// @access  Private/Admin
const markAttendance = asyncHandler(async (req, res) => {
    const { studentId, date, status, notes } = req.body;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
        student: studentId,
        date: new Date(date),
    });

    if (existingAttendance) {
        existingAttendance.status = status;
        existingAttendance.notes = notes;
        existingAttendance.recordedBy = req.user._id;
        const updatedAttendance = await existingAttendance.save();
        res.json(updatedAttendance);
    } else {
        const attendance = await Attendance.create({
            student: studentId,
            date: new Date(date),
            status,
            notes,
            recordedBy: req.user._id,
        });
        res.status(201).json(attendance);
    }
});

// @desc    Get attendance by student ID
// @route   GET /api/attendance/student/:studentId
// @access  Private (Admin/Student own data)
const getAttendanceByStudent = asyncHandler(async (req, res) => {
    const studentId = req.params.studentId;

    // Check permissions: Admin or the student themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
        res.status(401);
        throw new Error('Not authorized to view this attendance');
    }

    const attendance = await Attendance.find({ student: studentId }).sort({
        date: -1,
    });

    res.json(attendance);
});

// @desc    Get attendance by class and date
// @route   GET /api/attendance/class
// @access  Private/Admin
const getAttendanceByClass = asyncHandler(async (req, res) => {
    const { classLevel, date } = req.query;

    if (!classLevel || !date) {
        res.status(400);
        throw new Error('Please provide classLevel and date');
    }

    const queryDate = new Date(date);

    // 1. Get all active students in the class
    const students = await User.find({ classLevel, role: 'student', isActive: { $ne: false } })
        .select('_id name email studentId')
        .sort({ name: 1 });

    // 2. Get attendance records for this date
    // We need to match the exact date (start of day to end of day)
    // Or just exact match if we store it as midnight UTC
    const attendanceRecords = await Attendance.find({
        date: queryDate,
        student: { $in: students.map(s => s._id) }
    });

    // 3. Merge data
    const classAttendance = students.map(student => {
        const record = attendanceRecords.find(r => r.student.toString() === student._id.toString());
        return {
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                studentId: student.studentId
            },
            status: record ? record.status : 'Not Marked',
            notes: record ? record.notes : '',
            attendanceId: record ? record._id : null
        };
    });

    res.json(classAttendance);
});

module.exports = {
    markAttendance,
    getAttendanceByStudent,
    getAttendanceByClass
};
