const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  checkStatus,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const passport = require('passport');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.get('/status', protect, checkStatus);
router.put('/me', protect, updateUserProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Successful authentication
    // Generate token
    const token = require('../utils/generateToken')(req.user._id);

    const isProduction = process.env.NODE_ENV === 'production';

    // Set cookie - di production (cross-origin Vercel) pakai sameSite: 'none'
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,           // HTTPS wajib di production
      sameSite: isProduction ? 'none' : 'lax', // 'none' untuk cross-origin
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Redirect ke frontend dengan token di URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login/student?token=${token}`);
  }
);

module.exports = router;
