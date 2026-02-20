const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const Grade = require('../models/gradeModel');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: { $ne: false } });

    // Kehadiran hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceToday = await Attendance.countDocuments({
        date: { $gte: today },
        status: 'Present'
    });
    const attendanceRate = totalStudents > 0 ? (attendanceToday / totalStudents) * 100 : 0;

    // Rata-rata nilai
    const grades = await Grade.find({});
    const avgGrade = grades.length > 0 ? grades.reduce((acc, item) => acc + item.score, 0) / grades.length : 0;

    // Recent Students (last 5)
    const recentStudents = await User.find({ role: 'student', isActive: { $ne: false } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email studentId createdAt');

    // Weekly Attendance (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyAttendance = await Attendance.aggregate([
        {
            $match: {
                date: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                present: {
                    $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
                },
                absent: {
                    $sum: { $cond: [{ $ne: ["$status", "Present"] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Format weekly data to ensure all days are present
    const formattedWeeklyAttendance = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = weeklyAttendance.find(w => w._id === dateStr) || { present: 0, absent: 0 };
        formattedWeeklyAttendance.push({
            date: d.toLocaleDateString('id-ID', { weekday: 'short' }),
            Hadir: dayData.present,
            Absen: dayData.absent
        });
    }

    // List of classes that actually have students
    const activeClasses = await User.distinct('classLevel', { role: 'student', classLevel: { $exists: true } });

    res.json({
        totalStudents,
        attendanceRate: attendanceRate.toFixed(1),
        avgGrade: avgGrade.toFixed(1),
        activeClasses: activeClasses.length,
        recentStudents,
        weeklyAttendance: formattedWeeklyAttendance
    });
});

module.exports = { getStats };
