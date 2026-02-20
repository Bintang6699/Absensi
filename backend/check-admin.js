const mongoose = require('mongoose');
const User = require('./src/models/userModel');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        if (users.length > 0) {
            console.log('Users found:');
            users.forEach(u => console.log(`- ${u.email} (${u.role})`));
        } else {
            console.log('No users found in database.');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

connectDB();
