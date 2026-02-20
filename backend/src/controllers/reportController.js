const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const { generateAttendancePDF } = require('../utils/pdfGenerator');

const Grade = require('../models/gradeModel');

// @desc    Get Class Attendance PDF
// @route   GET /api/reports/attendance/class
// @access  Private/Admin
const getClassAttendanceReport = asyncHandler(async (req, res) => {
    const { classLevel, date } = req.query;

    if (!classLevel || !date) {
        res.status(400);
        throw new Error('Missing classLevel or date');
    }

    // Reuse logic to fetch data (similar to attendanceController)
    const queryDate = new Date(date);
    // Find all students in that class (exclude soft deleted if any remain)
    const students = await User.find({ classLevel, role: 'student', isActive: { $ne: false } }).sort({ name: 1 });

    // Find attendance records for that day
    const attendanceRecords = await Attendance.find({
        date: {
            $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
            $lt: new Date(queryDate.setHours(23, 59, 59, 999))
        },
        student: { $in: students.map(s => s._id) }
    });

    const attendanceData = students.map(student => {
        const record = attendanceRecords.find(r => r.student.toString() === student._id.toString());
        return {
            student: { name: student.name },
            status: record ? record.status : 'Not Marked',
            notes: record ? (record.notes || '-') : '-'
        };
    });

    // Create PDF
    const doc = new PDFDocument();

    // Set response headers
    const filename = `Attendance_${classLevel}_${date}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    generateAttendancePDF(doc, {
        classLevel,
        date,
        attendance: attendanceData
    });

    doc.end();
});

// @desc    Get Student Report Card PDF
// @route   GET /api/reports/student/:id
// @access  Private (Admin/Student own data)
const getStudentReportCard = asyncHandler(async (req, res) => {
    const studentId = req.params.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const student = await User.findById(studentId);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Reuse logic from gradeController summary
    const grades = await Grade.find({ student: studentId }).sort({ date: -1 });
    const attendance = await Attendance.find({ student: studentId });

    const totalScore = grades.reduce((acc, item) => acc + item.score, 0);
    const averageScore = grades.length > 0 ? (totalScore / grades.length).toFixed(1) : 0;

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Create PDF
    const doc = new PDFDocument();

    const filename = `ReportCard_${student.name.replace(/ /g, '_')}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Generate Content
    doc.fontSize(20).text('Lembaga Kursus Bahasa Inggris', { align: 'center' });
    doc.fontSize(16).text('Laporan Hasil Belajar Siswa', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Nama: ${student.name}`);
    doc.text(`Kelas: ${student.classLevel || '-'}`);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Ringkasan Performa', { underline: true });
    doc.fontSize(12).text(`Rata-rata Nilai: ${averageScore}`);
    doc.text(`Kehadiran: ${attendancePercentage}% (${presentDays}/${totalDays})`);
    doc.moveDown();

    doc.fontSize(14).text('Detail Nilai', { underline: true });

    // Table Header
    const tableTop = doc.y + 10;
    doc.font('Helvetica-Bold');
    doc.text('Judul', 50, tableTop);
    doc.text('Tipe', 250, tableTop);
    doc.text('Nilai', 350, tableTop);
    doc.text('Tanggal', 450, tableTop);
    doc.font('Helvetica');

    // Table Rows
    let y = tableTop + 20;
    grades.forEach((grade) => {
        doc.text(grade.title, 50, y);
        doc.text(grade.type, 250, y);
        doc.text(grade.score.toString(), 350, y);
        doc.text(new Date(grade.date).toLocaleDateString(), 450, y);
        y += 20;
    });

    doc.end();
});

module.exports = { getClassAttendanceReport, getStudentReportCard };
