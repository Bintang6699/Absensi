const mongoose = require('mongoose');
const User = require('./src/models/userModel');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = 'admin@gmail.com';
        const password = 'admin6699'; // Using the same as MongoDB pass for consistency

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists');
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Admin CMS',
            email,
            password,
            role: 'admin'
        });

        console.log('Admin created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
