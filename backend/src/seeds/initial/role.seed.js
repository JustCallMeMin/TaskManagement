const mongoose = require('mongoose');
const { ROLE } = require('../../utils/enums');
const Role = require('../../models/role.model');

/**
 * Khởi tạo Roles nếu chưa có
 */
const seedRoles = async () => {
  try {
    const existingRoles = await Role.find({}, "roleName");
    const existingRoleNames = existingRoles.map((r) => r.roleName);

    const rolesToInsert = Object.values(ROLE).filter(
      (role) => !existingRoleNames.includes(role)
    );

    if (rolesToInsert.length > 0) {
      await Role.insertMany(rolesToInsert.map((roleName) => ({ roleName })));
      console.log("✅ Đã tạo các roles còn thiếu:", rolesToInsert);
    } else {
      console.log("✅ Tất cả roles đã tồn tại.");
    }
    
    return await Role.find();
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo Roles:", error);
    throw error;
  }
};

module.exports = seedRoles;

// Nếu chạy trực tiếp file này
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedRoles();
    })
    .then(() => {
      console.log('Role seeding completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during role seeding:', err);
      process.exit(1);
    });
} 