const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Excused', 'Late'],
            required: true,
        },
        notes: {
            type: String,
        },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Admin who recorded it
        }
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate attendance for same student on same day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
