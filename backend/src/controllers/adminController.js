const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Ban a user
// @route   POST /api/admin/ban
// @access  Private/Admin
const banUser = asyncHandler(async (req, res) => {
    const { userId, reason, expires } = req.body;

    if (!userId || !reason) {
        res.status(400);
        throw new Error('User ID and ban reason are required');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot ban admin users');
    }

    user.isBanned = true;
    user.banReason = reason;
    user.banExpires = expires || null; // null means permanent
    user.bannedBy = req.user._id;

    await user.save();

    res.json({
        message: 'User banned successfully',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isBanned: user.isBanned,
            banReason: user.banReason,
            banExpires: user.banExpires,
        },
    });
});

// @desc    Unban a user
// @route   POST /api/admin/unban
// @access  Private/Admin
const unbanUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isBanned = false;
    user.banReason = null;
    user.banExpires = null;
    user.bannedBy = null;

    await user.save();

    res.json({
        message: 'User unbanned successfully',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isBanned: user.isBanned,
        },
    });
});

// @desc    Get all banned users
// @route   GET /api/admin/banned
// @access  Private/Admin
const getBannedUsers = asyncHandler(async (req, res) => {
    const bannedUsers = await User.find({
        isBanned: true,
        role: 'student',
    }).populate('bannedBy', 'name email');

    res.json(bannedUsers);
});

module.exports = {
    banUser,
    unbanUser,
    getBannedUsers,
};
