const mongoose = require('mongoose');
const User = require('./src/models/userModel');
const Attendance = require('./src/models/attendanceModel');
const Grade = require('./src/models/gradeModel');
const Message = require('./src/models/messageModel');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const deleteStudentData = async () => {
    try {
        // Hardcode URI to bypass potential env/DNS issues in script
        const uri = "mongodb+srv://admin:admin6699@cluster0.s85c05a.mongodb.net/absensi?retryWrites=true&w=majority";
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Find the user "Bintang Ahmad"
        // Using regex to match case-insensitive and partial names just in case
        const studentName = "Bintang Ahmad";
        const student = await User.findOne({ name: { $regex: new RegExp(studentName, 'i') } });

        if (!student) {
            console.log(`User "${studentName}" not found.`);
            process.exit(0);
        }

        console.log(`Found user: ${student.name} (${student._id})`);

        // 1. Delete Attendance Records
        const attendanceResult = await Attendance.deleteMany({ student: student._id });
        console.log(`Deleted ${attendanceResult.deletedCount} attendance records.`);

        // 2. Delete Grades
        const gradeResult = await Grade.deleteMany({ student: student._id });
        console.log(`Deleted ${gradeResult.deletedCount} grade records.`);

        // 3. Delete Messages (Sent by or Received by)
        const messageResult = await Message.deleteMany({
            $or: [
                { sender: student._id },
                { recipients: student._id }
            ]
        });
        console.log(`Deleted ${messageResult.deletedCount} messages.`);

        // 4. Delete the User
        const userResult = await User.findByIdAndDelete(student._id);
        console.log(`Deleted user profile: ${userResult.name}`);

        console.log('All data deleted successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error deleting data:', error);
        process.exit(1);
    }
};

deleteStudentData();
