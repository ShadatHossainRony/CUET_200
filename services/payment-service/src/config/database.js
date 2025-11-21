const mongoose = require('mongoose');

async function connectDatabase() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('Missing MONGO_URI environment variable');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri, {
            autoIndex: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

module.exports = { connectDatabase };
