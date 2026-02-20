const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');



// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (or Admin only for creating students/teachers)
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, classLevel } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    // Password hashing is handled in the model pre-save hook
    const userData = {
        name,
        email,
        password,
        role: role || 'student',
        classLevel: role === 'admin' ? undefined : classLevel,
    };



    const user = await User.create(userData);

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            token: generateToken(user._id), // Token sent in JSON and cookie
        });

        // Set cookie
        const token = generateToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            token: generateToken(user._id), // Token sent in JSON and cookie
            isBanned: user.isBanned,
            banReason: user.banReason,
            banExpires: user.banExpires,
            updatedAt: user.updatedAt,
        });

        // Set cookie
        const token = generateToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from strict for better localhost support
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // Generate a fresh token so frontend can keep its localStorage in sync 
    // especially after Google Auth or page refresh where only cookie might be present
    const user = req.user.toObject();
    user.token = generateToken(req.user._id);
    res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.age = req.body.age || user.age;
        user.institution = req.body.institution || user.institution;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            age: updatedUser.age,
            institution: updatedUser.institution,
            role: updatedUser.role,
            studentId: updatedUser.studentId,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Check current user status (lean for polling)
// @route   GET /api/auth/status
// @access  Private
const checkStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('isBanned banReason banExpires');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({
        isBanned: user.isBanned,
        banReason: user.banReason,
        banExpires: user.banExpires
    });
});

// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    checkStatus,
    logoutUser,
};
