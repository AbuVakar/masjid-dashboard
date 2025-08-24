// Usage: node resetAdminPassword.js <admin_email_or_username> <new_password>

require('dotenv').config({ path: './server/config/config.env' }); // Load env vars

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./server/models/User'); // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/silsila_ul_ahwaal';

async function resetAdminPassword(identifier, newPassword) {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);

    // Find admin by email or username
    const admin = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
        role: 'admin'
    });

    if (!admin) {
        console.error('Admin user not found');
        process.exit(1);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    console.log('Admin password reset successful');
    mongoose.disconnect();
}

const [,, identifier, newPassword] = process.argv;
if (!identifier || !newPassword) {
    console.error('Usage: node resetAdminPassword.js <admin_email_or_username> <new_password>');
    process.exit(1);
}

resetAdminPassword(identifier, newPassword);
