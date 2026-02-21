require('dotenv').config();
const path = require('path');
const express = require('express');
const app = require('./app');
const connectDB = require('./src/config/db');

// Serve static files (uploads) - hanya di development lokal
// Di Vercel, file di /tmp tidak persistent, tapi setidaknya tidak crash
app.use('/uploads', express.static(
    process.env.NODE_ENV === 'production'
        ? '/tmp/uploads'
        : path.join(__dirname, 'uploads')
));

// Untuk Vercel Serverless: pastikan DB terkoneksi SEBELUM handle request
// dengan middleware yang menunggu koneksi
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection failed:', err.message);
        res.status(503).json({ message: 'Database not available, please try again.' });
    }
});

// Jalankan server HANYA di development lokal
// Di Vercel (serverless), cukup export app
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;

    // Connect DB saat start di lokal
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Failed to connect to DB:', err);
        process.exit(1);
    });
}

// Export untuk Vercel Serverless Function
module.exports = app;
