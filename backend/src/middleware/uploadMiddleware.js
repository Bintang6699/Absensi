const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Di Vercel serverless, filesystem read-only KECUALI /tmp
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : 'uploads/';

// Buat direktori jika belum ada - DIBUNGKUS try-catch agar tidak crash di Vercel
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.warn('Upload directory warning:', err.message);
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    // Accept images, pdfs, docs
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: File type not supported!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = upload;
