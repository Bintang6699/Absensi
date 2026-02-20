const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { recipients, subject, content, category, isBroadcast, parentMessage } = req.body;

    if (!subject || !content) {
        res.status(400);
        throw new Error('Subject and content are required');
    }

    // Rate limiting for students (1 message per 24 hours to admin)
    if (req.user.role === 'student') {
        const lastMessageTime = req.user.lastMessageSentAt;
        if (lastMessageTime) {
            const timeSinceLastMessage = Date.now() - new Date(lastMessageTime).getTime();
            const hoursRemaining = 24 - (timeSinceLastMessage / (1000 * 60 * 60));

            if (hoursRemaining > 0) {
                res.status(429);
                throw new Error(`You can send another message in ${Math.ceil(hoursRemaining)} hours`);
            }
        }

        // Update last message sent time
        req.user.lastMessageSentAt = Date.now();
        await req.user.save();

        // For students, automatically send to all admins
        const admins = await User.find({ role: 'admin' });
        const adminIds = admins.map(admin => admin._id);

        // Process attachments
        let attachmentData = [];
        if (req.files && req.files.length > 0) {
            attachmentData = req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        const message = await Message.create({
            sender: req.user._id,
            recipients: adminIds,
            subject,
            content,
            category: 'private', // Student messages are always private
            isBroadcast: false,
            attachments: attachmentData,
            parentMessage: parentMessage || null
        });

        res.status(201).json(message);
    } else {
        // Admin/Teacher sending message
        let recipientIds = [];

        if (isBroadcast) {
            // Send to all students
            const allStudents = await User.find({ role: 'student', isActive: { $ne: false }, isBanned: false });
            recipientIds = allStudents.map(student => student._id);
        } else {
            recipientIds = recipients; // Array of student IDs
        }

        if (!recipientIds || recipientIds.length === 0) {
            res.status(400);
            throw new Error('No recipients specified');
        }

        // Process attachments
        let attachmentData = [];
        if (req.files && req.files.length > 0) {
            attachmentData = req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        const message = await Message.create({
            sender: req.user._id,
            recipients: recipientIds,
            subject,
            content,
            category: category || 'note',
            isBroadcast: isBroadcast || false,
            attachments: attachmentData,
            parentMessage: parentMessage || null
        });

        res.status(201).json(message);
    }
});

// @desc    Get messages (inbox or sent)
// @route   GET /api/messages?type=inbox|sent
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const { type } = req.query;

    let messages;

    if (type === 'inbox') {
        // Messages where user is a recipient and hasn't deleted
        messages = await Message.find({
            recipients: req.user._id,
            deletedBy: { $ne: req.user._id },
        })
            .populate('sender', 'name email role')
            .sort({ createdAt: -1 });
    } else if (type === 'sent') {
        // Messages sent by user and not deleted
        messages = await Message.find({
            sender: req.user._id,
            deletedBy: { $ne: req.user._id },
        })
            .populate('recipients', 'name email studentId')
            .sort({ createdAt: -1 });
    } else {
        res.status(400);
        throw new Error('Invalid message type. Use inbox or sent');
    }

    // Add read status for each message
    const messagesWithReadStatus = messages.map(msg => {
        const isRead = msg.readBy.some(r => r.user.toString() === req.user._id.toString());
        return {
            ...msg.toObject(),
            isRead,
        };
    });

    res.json(messagesWithReadStatus);
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const readMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    // Check if user is a recipient
    if (!message.recipients.includes(req.user._id)) {
        res.status(401);
        throw new Error('Not authorized to read this message');
    }

    // Check if already read
    const alreadyRead = message.readBy.some(r => r.user.toString() === req.user._id.toString());

    if (!alreadyRead) {
        message.readBy.push({
            user: req.user._id,
            readAt: Date.now(),
        });
        await message.save();
    }

    res.json({ message: 'Message marked as read' });
});

// @desc    Delete message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    // Check if user is sender or recipient
    const isSender = message.sender.toString() === req.user._id.toString();
    const isRecipient = message.recipients.includes(req.user._id);

    if (!isSender && !isRecipient) {
        res.status(401);
        throw new Error('Not authorized to delete this message');
    }

    // Add user to deletedBy array
    if (!message.deletedBy.includes(req.user._id)) {
        message.deletedBy.push(req.user._id);
        await message.save();
    }

    res.json({ message: 'Message deleted successfully' });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    const messages = await Message.find({
        recipients: req.user._id,
        deletedBy: { $ne: req.user._id },
    });

    const unreadCount = messages.filter(msg =>
        !msg.readBy.some(r => r.user.toString() === req.user._id.toString())
    ).length;

    res.json({ unreadCount });
});

module.exports = {
    sendMessage,
    getMessages,
    readMessage,
    deleteMessage,
    getUnreadCount,
};
