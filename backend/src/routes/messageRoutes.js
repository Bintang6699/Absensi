const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessages, readMessage, deleteMessage, getUnreadCount } = require('../controllers/messageController');

const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('attachments', 5), sendMessage);
router.get('/', protect, getMessages);
router.get('/unread/count', protect, getUnreadCount);
router.put('/:id/read', protect, readMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
