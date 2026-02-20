require('dotenv').config();
const express = require('express');
const path = require('path');
const app = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Production specific settings (if applicable, based on the original instruction's intent)
if (process.env.NODE_ENV === 'production') {
    // This block was incomplete in the instruction, assuming it's for serving client build or similar.
    // For now, it's left as an empty block or can be filled with typical production setup.
    // Example: app.use(express.static(path.join(__dirname, '../client/build')));
    // Example: app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html')));
}

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
