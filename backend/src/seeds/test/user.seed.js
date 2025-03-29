const mongoose = require('mongoose');
const User = require('../../models/user.model');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

/**
 * Seeds the database with sample users for testing
 * @param {Number} count - Số lượng user cần tạo
 * @param {Boolean} clearExisting - Xóa user hiện có trước khi tạo mới
 */
async function seedUsers(count = 10, clearExisting = false) {
  try {
    console.log('Starting user seeding...');
    
    // Delete existing users only if clearExisting is true
    if (clearExisting) {
      const deleted = await User.deleteMany({
        email: { $ne: process.env.ADMIN_EMAIL } // Không xóa admin user
      });
      console.log(`Deleted ${deleted.deletedCount} existing users`);
    } else {
      console.log('Preserving existing users');
    }
    
    // Tạo mật khẩu mặc định
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Tìm users hiện có để không tạo trùng email
    const existingEmails = await User.find().distinct('email');
    
    const users = [];
    for (let i = 0; i < count; i++) {
      // Tạo email không trùng với existing emails
      let email;
      do {
        email = faker.internet.email().toLowerCase();
      } while (existingEmails.includes(email));
      
      existingEmails.push(email);
      
      // Tạo số điện thoại hợp lệ (10 chữ số)
      const phone = '0' + faker.string.numeric(9);
      
      const user = {
        fullName: faker.person.fullName(),
        email,
        phone,
        password: hashedPassword,
        isVerified: true,
        isBlocked: false,
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date()
      };
      
      users.push(user);
    }
    
    // Insert users nếu có
    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`Successfully seeded ${users.length} users`);
    } else {
      console.log('No new users created');
    }
    
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

module.exports = seedUsers;

// If this script is run directly (not imported), execute the seed function
if (require.main === module) {
  // Parse command line args
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 10;
  const clearExisting = args.includes('--clear') || args.includes('-c');

  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedUsers(count, clearExisting);
    })
    .then(() => {
      console.log('User seeding completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during user seeding:', err);
      process.exit(1);
    });
} 