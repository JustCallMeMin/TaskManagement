const mongoose = require('mongoose');
const User = require('../../models/user.model');
const Role = require('../../models/role.model');
const UserRole = require('../../models/user_role.model');
const bcrypt = require('bcryptjs');
const { ROLE } = require('../../utils/enums');
require('dotenv').config();

/**
 * Khởi tạo tài khoản admin
 */
const seedAdmin = async () => {
  try {
    // Kiểm tra xem đã có admin chưa
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminPhone = process.env.ADMIN_PHONE || '0123456789';
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      console.log("✅ Tài khoản admin đã tồn tại.");
      return adminExists;
    }

    // Tạo admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await User.create({
      fullName: "System Admin",
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      isVerified: true,
      isBlocked: false,
    });

    // Gán role ADMIN
    const adminRole = await Role.findOne({ roleName: ROLE.ADMIN });
    if (adminRole) {
      await UserRole.create({
        userId: adminUser._id,
        roleId: adminRole._id,
      });
      console.log("✅ Đã tạo tài khoản admin và gán quyền thành công.");
    } else {
      console.error("❌ Không tìm thấy role ADMIN trong database.");
    }
    
    return adminUser;
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo Admin:", error);
    throw error;
  }
};

module.exports = seedAdmin;

// Nếu chạy trực tiếp file này
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedAdmin();
    })
    .then(() => {
      console.log('Admin seeding completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during admin seeding:', err);
      process.exit(1);
    });
} 