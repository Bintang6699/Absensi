const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Grade = require('../models/gradeModel');
const Attendance = require('../models/attendanceModel');
const Message = require('../models/messageModel');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const noPage = req.query.nopage === 'true';

    console.log('Fetching students:', { page, pageSize, keyword: req.query.keyword });

    const keyword = req.query.keyword
        ? {
            $or: [
                {
                    name: {
                        $regex: req.query.keyword,
                        $options: 'i',
                    },
                },
                {
                    studentId: {
                        $regex: req.query.keyword,
                        $options: 'i',
                    },
                },
            ],
        }
        : {};

    const classFilter = req.query.classLevel
        ? { classLevel: req.query.classLevel }
        : {};

    const count = await User.countDocuments({
        ...keyword,
        ...classFilter,
        role: 'student',
        isActive: { $ne: false },
    });

    let students;
    if (noPage) {
        students = await User.find({
            ...keyword,
            ...classFilter,
            role: 'student',
            isActive: { $ne: false },
        }).select('-password');
    } else {
        students = await User.find({
            ...keyword,
            ...classFilter,
            role: 'student',
            isActive: { $ne: false },
        })
            .select('-password')
            .limit(pageSize)
            .skip(pageSize * (page - 1));
    }

    res.json({ students, page, pages: noPage ? 1 : Math.ceil(count / pageSize), count });
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudentById = asyncHandler(async (req, res) => {
    // Permission check: Admin can see any student, Student can only see themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        res.status(401);
        throw new Error('Not authorized to access this data');
    }

    const student = await User.findById(req.params.id).select('-password');

    if (student && student.role === 'student') {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
    // Permission check: Admin can update any student, Student can only update themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        res.status(401);
        throw new Error('Not authorized to update this data');
    }

    const student = await User.findById(req.params.id);

    if (student && student.role === 'student') {
        // Only admin can change these fields
        if (req.user.role === 'admin') {
            student.name = req.body.name || student.name;
            student.email = req.body.email || student.email;
            student.classLevel = req.body.classLevel || student.classLevel;
        }

        // Both Admin and Student can update these fields
        if (req.body.biodata) {
            student.biodata = { ...student.biodata, ...req.body.biodata };
        }
        if (req.body.age) student.age = req.body.age;
        if (req.body.institution) student.institution = req.body.institution;
        if (req.body.dashboardConfig) student.dashboardConfig = req.body.dashboardConfig;

        const updatedStudent = await student.save();

        res.json({
            _id: updatedStudent._id,
            name: updatedStudent.name,
            email: updatedStudent.email,
            role: updatedStudent.role,
            classLevel: updatedStudent.classLevel,
            age: updatedStudent.age,
            institution: updatedStudent.institution,
            biodata: updatedStudent.biodata,
            dashboardConfig: updatedStudent.dashboardConfig,
        });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Delete student (Hard delete)
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id);

    if (student && student.role === 'student') {
        // 1. Delete Attendance Records
        await Attendance.deleteMany({ student: student._id });

        // 2. Delete Grades
        await Grade.deleteMany({ student: student._id });

        // 3. Delete Messages (Sent by or Received by)
        await Message.deleteMany({
            $or: [
                { sender: student._id },
                { recipients: student._id }
            ]
        });

        // 4. Delete the User
        await User.findByIdAndDelete(student._id);

        res.json({ message: 'Student and all associated data permanently deleted' });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

module.exports = {
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
};
