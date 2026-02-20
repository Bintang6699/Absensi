const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Get token from header
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2) {
            token = parts[1];
        }
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (token && token !== 'null' && token !== 'undefined') {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            // Check if user is banned
            if (req.user.isBanned) {
                // Check if temporary ban has expired
                if (req.user.banExpires && new Date() > new Date(req.user.banExpires)) {
                    // Auto-unban
                    req.user.isBanned = false;
                    req.user.banReason = null;
                    req.user.banExpires = null;
                    req.user.bannedBy = null;
                    await req.user.save();
                } else {
                    // User is still banned
                    res.status(403);
                    throw new Error(JSON.stringify({
                        banned: true,
                        reason: req.user.banReason,
                        expires: req.user.banExpires,
                        bannedDate: req.user.updatedAt,
                    }));
                }
            }

            return next();
        } catch (error) {
            res.status(401);
            if (error.message.includes('banned')) throw error; // Re-throw ban JSON
            throw new Error('Not authorized, token failed');
        }
    }

    // If no token was found at all
    res.status(401);
    throw new Error('Not authorized, no token');
});

const admin = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };
