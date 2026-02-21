const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

module.exports = function (passport) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn("Google OAuth credentials not found in .env, skipping Google Strategy setup.");
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                // WAJIB full URL di Vercel (bukan relative path)
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                const newUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value, // google may request "email" scope
                    role: 'student', // Default role for Google login
                    avatar: profile.photos[0].value,
                };

                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        done(null, user);
                    } else {
                        // Check if user exists by email to merge? 
                        // For now, if email exists but no googleId, we can either merge or error.
                        // Let's try to find by email
                        user = await User.findOne({ email: newUser.email });

                        if (user) {
                            user.googleId = profile.id;
                            user.avatar = user.avatar || newUser.avatar;
                            await user.save();
                            done(null, user);
                        } else {
                            user = await User.create(newUser);
                            done(null, user);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
