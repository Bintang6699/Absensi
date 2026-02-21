require('dotenv').config();
const path = require('path');
const express = require('express');
const app = require('./app');
const connectDB = require('./src/config/db');

// Connect to Database
connectDB();

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Jalankan server hanya di development lokal
// Di Vercel (production/serverless), tidak perlu app.listen()
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

// Export app untuk Vercel Serverless Function
module.exports = app;
