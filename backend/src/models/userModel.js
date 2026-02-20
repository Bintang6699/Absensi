const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            // required: [true, 'Please add a password'], // Not required for Google OAuth users
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        googleId: {
            type: String,
        },
        classLevel: {
            type: String,
            enum: ['Basic', 'Intermediate', 'Advanced'],
            // Only for students, but keeping it simple for now
        },
        age: {
            type: Number,
            min: 5,
            max: 99,
        },
        institution: {
            type: String,
            maxLength: 100,
        },
        biodata: {
            address: String,
            phone: String,
        },
        avatar: {
            type: String, // URL to image
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        studentId: {
            type: String,
            unique: true,
            sparse: true, // Only students will have this
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
        banReason: {
            type: String,
        },
        banExpires: {
            type: Date, // null for permanent ban
        },
        bannedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lastMessageSentAt: {
            type: Date, // For rate limiting student messages
        },
        dashboardConfig: {
            type: [mongoose.Schema.Types.Mixed], // Flexible structure for widgets
            default: [] // Empty means default layout
        },
        dashboard_layout: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Generate Student ID (F-S1)
userSchema.pre('save', async function () {
    // Only generate for students and if not already set
    if (this.role === 'student' && !this.studentId) {
        let isUnique = false;
        while (!isUnique) {
            // Generate random number between 1000 and 999999 (4-6 digits)
            const randomNum = Math.floor(Math.random() * (999999 - 1000 + 1)) + 1000;
            const newId = `id_${randomNum}`;

            // Check uniqueness
            const existingUser = await mongoose.models.User.findOne({ studentId: newId });
            if (!existingUser) {
                this.studentId = newId;
                isUnique = true;
            }
        }
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
