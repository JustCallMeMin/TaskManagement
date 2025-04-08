require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Connect to MongoDB using the same connection string as the application
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/task_management")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

async function resetAdminPassword() {
  try {
    // Find the admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const newPassword = 'Admin@123'; // You can change this to any password you want
    
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.error(`Admin user with email ${adminEmail} not found`);
      process.exit(1);
    }
    
    console.log(`Found admin user: ${admin.fullName} (${admin.email})`);
    
    // Set the raw password (the pre-save hook will hash it)
    admin.password = newPassword;
    await admin.save();
    
    console.log(`Admin password has been reset successfully to: ${newPassword}`);
    console.log('You can now login with these credentials');
    
    // Close the MongoDB connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

// Run the script
resetAdminPassword();
