require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/user.model');

// The password we want to set
const newPassword = 'Admin@123';

async function setAdminPassword() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    console.log(`Looking for admin with email: ${adminEmail}`);
    
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      console.log('Admin user not found. Please start the server to create the admin user first.');
      return;
    }
    
    console.log(`Found admin user with ID: ${adminUser._id}`);
    
    // Hash the password manually (just once)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin user with the new password hash
    // This bypasses the pre-save hooks in the model
    const updateResult = await User.updateOne(
      { _id: adminUser._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log(`Password update result: ${JSON.stringify(updateResult)}`);
    console.log(`Admin password has been set to "${newPassword}"`);
    console.log('You should now be able to log in with this password.');
  } catch (error) {
    console.error('Error setting admin password:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
setAdminPassword(); 