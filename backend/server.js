require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');

// Jalankan server HANYA di development lokal
// Di Vercel (serverless), cukup export app
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;

    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Gagal koneksi ke DB:', err);
        process.exit(1);
    });
}

// Export untuk Vercel Serverless Function
module.exports = app;
