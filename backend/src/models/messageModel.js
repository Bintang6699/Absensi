const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipients: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        subject: {
            type: String,
            required: [true, 'Subject is required'],
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
        },
        category: {
            type: String,
            enum: ['warning', 'info', 'note', 'private'], // private for student->teacher
            default: 'note',
        },
        isBroadcast: {
            type: Boolean,
            default: false,
        },
        readBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            readAt: {
                type: Date,
                default: Date.now,
            },
        }],
        deletedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        parentMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },
        attachments: [{
            filename: String,
            path: String,
            mimetype: String,
            size: Number,
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Message', messageSchema);
