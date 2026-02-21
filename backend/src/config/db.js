const mongoose = require('mongoose');

// Cache koneksi untuk Vercel Serverless
// Hindari membuat koneksi baru setiap request
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB: menggunakan koneksi yang sudah ada');
        return;
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            // JANGAN pakai bufferCommands: false di serverless!
            // Biarkan Mongoose buffer command sambil tunggu koneksi
        });
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('--- MongoDB Connection Error ---');
        console.error(`Message: ${error.message}`);
        console.error('--------------------------------');
        // JANGAN process.exit() di Vercel Serverless!
        // Cukup throw error agar request gagal dengan graceful
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

module.exports = connectDB;
