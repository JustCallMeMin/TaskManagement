const mongoose = require('mongoose');
const seedUsers = require('./user.seed');
const seedProjects = require('./project.seed');
const seedTasks = require('./task.seed');
require('dotenv').config();

/**
 * Chạy tất cả các test seeds
 * @param {Object} options - Tùy chọn cho việc seeding
 * @param {Boolean} options.clearExisting - Xóa dữ liệu hiện có trước khi seed
 */
const runTestSeeds = async (options = { clearExisting: false }) => {
  try {
    console.log('⏳ Đang chạy test seeds...');
    console.log(`${options.clearExisting ? '⚠️ Xóa' : '✅ Giữ nguyên'} dữ liệu hiện có.`);

    // Chạy theo thứ tự: users -> projects -> tasks
    const users = await seedUsers(10, options.clearExisting);
    const projects = await seedProjects(15, options.clearExisting);
    const tasks = await seedTasks(50, options.clearExisting);

    console.log('✅ Đã hoàn thành test seeds!');
    console.log(`📊 Đã tạo: ${users.length} users, ${projects.length} projects, ${tasks.length} tasks`);
    
    return { users, projects, tasks };
  } catch (error) {
    console.error('❌ Lỗi khi chạy test seeds:', error);
    throw error;
  }
};

module.exports = { runTestSeeds };

// Nếu chạy trực tiếp file này
if (require.main === module) {
  // Lấy tham số từ command line
  const args = process.argv.slice(2);
  const clearExisting = args.includes('--clear') || args.includes('-c');

  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task_management')
    .then(() => {
      console.log('📦 Đã kết nối MongoDB');
      return runTestSeeds({ clearExisting });
    })
    .then(() => {
      console.log('🎉 Test seeding completed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Lỗi:', err);
      process.exit(1);
    });
} 