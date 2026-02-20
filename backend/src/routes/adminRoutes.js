const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { banUser, unbanUser, getBannedUsers } = require('../controllers/adminController');

router.post('/ban', protect, admin, banUser);
router.post('/unban', protect, admin, unbanUser);
router.get('/banned', protect, admin, getBannedUsers);

module.exports = router;
