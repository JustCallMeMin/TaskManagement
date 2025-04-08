require('dotenv').config();
const mongoose = require('mongoose');
const seedPermissions = require('./src/seeds/initial/permission.seed');

async function updatePermissions() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/task_management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Kết nối MongoDB thành công, bắt đầu cập nhật quyền...');
    
    // Chạy seed permissions
    await seedPermissions();
    
    console.log('Cập nhật quyền thành công!');
    
    // Đóng kết nối
    await mongoose.connection.close();
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền:', error);
    process.exit(1);
  }
}

updatePermissions();
