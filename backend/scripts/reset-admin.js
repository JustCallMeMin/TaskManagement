require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const UserRole = require('../src/models/user_role.model');

async function resetAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management';
    console.log(`URI: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    console.log(`Looking for admin email: ${adminEmail}`);
    
    // Drop the email index to resolve duplicate key issues
    console.log('Dropping email index to resolve duplicate key issues...');
    try {
      await mongoose.connection.db.collection('users').dropIndex('email_1');
      console.log('Successfully dropped email index');
    } catch (indexError) {
      console.log('No email index found or error dropping index:', indexError.message);
    }

    // Delete all users with this email (to be thorough)
    console.log('Deleting all users with admin email...');
    const deleteUsersResult = await User.deleteMany({ email: adminEmail });
    console.log(`Deleted ${deleteUsersResult.deletedCount} users with admin email`);

    // Delete all orphaned user roles (where user no longer exists)
    console.log('Cleaning up orphaned user roles...');
    const userRoles = await UserRole.find({});
    let deletedRoles = 0;
    
    for (const role of userRoles) {
      const userExists = await User.findById(role.userId);
      if (!userExists) {
        await UserRole.deleteOne({ _id: role._id });
        deletedRoles++;
      }
    }
    console.log(`Deleted ${deletedRoles} orphaned user roles`);

    // Recreate the index (will be done by model when server restarts)
    console.log('Admin reset complete. Restart your server to recreate indexes and create a fresh admin account.');
  } catch (error) {
    console.error('Error resetting admin:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
resetAdmin(); 