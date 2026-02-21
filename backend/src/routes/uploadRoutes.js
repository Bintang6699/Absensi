const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Di Vercel serverless, filesystem read-only kecuali /tmp
// Gunakan /tmp untuk temporary storage
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : 'uploads';

// Buat direktori jika belum ada (dibungkus try-catch agar tidak crash)
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.warn('Tidak bisa membuat upload directory:', err.message);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung (hanya JPG, PNG, GIF)'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: fileFilter
});

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Tidak ada file yang diunggah');
    }
    // Return relative path
    res.json({
        filePath: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
