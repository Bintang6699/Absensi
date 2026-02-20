const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use specific DNS servers to avoid issues with local DNS refusing SRV lookups
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Adding these options can sometimes help with stability in certain environments
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('--- MongoDB Connection Error ---');
        console.error(`Message: ${error.message}`);
        console.error(`Code: ${error.code}`);
        if (error.message.includes('querySrv ECONNREFUSED')) {
            console.error('Suggestion: This seems like a DNS issue resolving the SRV record. Please check your internet connection or try using a different DNS server.');
        }
        console.error('--------------------------------');
        process.exit(1);
    }
};

module.exports = connectDB;
