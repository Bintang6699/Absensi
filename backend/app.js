const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./src/middleware/errorMiddleware');
const passport = require('passport');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

// Initialize app
const app = express();

require('./src/config/passport')(passport);

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS - dukung multiple origins (localhost dev + Vercel frontend URL)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: Origin ${origin} tidak diizinkan`));
    },
    credentials: true,
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(passport.initialize());

// ── DB CONNECTION MIDDLEWARE ──────────────────────────────────────────────────
// WAJIB sebelum semua routes agar DB sudah terkoneksi saat request masuk
// Ini solusi untuk Vercel Serverless cold start
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection error:', err.message);
        res.status(503).json({
            message: 'Database tidak tersedia, coba lagi dalam beberapa detik.'
        });
    }
});
// ─────────────────────────────────────────────────────────────────────────────

// Static Folder untuk uploads (development)
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} else {
    // Di Vercel, file uploads ada di /tmp
    app.use('/uploads', express.static('/tmp/uploads'));
}

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/students', require('./src/routes/studentRoutes'));
app.use('/api/attendance', require('./src/routes/attendanceRoutes'));
app.use('/api/grades', require('./src/routes/gradeRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));

app.get('/', (req, res) => {
    res.send('English Course Management System API is running...');
});

// Error Handler
app.use(errorHandler);

module.exports = app;
