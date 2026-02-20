const mongoose = require('mongoose');

const gradeSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String, // e.g. "Weekly Quiz 1", "Midterm Exam"
            required: true,
        },
        subject: {
            type: String, // e.g. "Math", "English"
            default: 'General',
        },
        type: {
            type: String, // Recommended: Assignment, Quiz, Midterm, Final, Usage
            default: 'Assignment',
        },
        status: {
            type: String,
            enum: ['Lulus', 'Tidak Lulus'],
            default: 'Lulus',
        },
        score: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        feedback: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Grade', gradeSchema);
