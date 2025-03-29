const mongoose = require('mongoose');
const Project = require('../../models/project.model');
const Task = require('../../models/task.model');
const { PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY } = require('../../utils/enums');
const moment = require('moment');
require('dotenv').config();

// User ID cần tạo dữ liệu
const USER_ID = '67d8d845c9b72e66289a0c6e';

/**
 * Tạo các dự án mẫu cho user
 */
const seedProjects = async () => {
  try {
    const userId = new mongoose.Types.ObjectId(USER_ID);
    console.log(`Tạo dự án cho user ${USER_ID}...`);

    // Xóa các dự án cũ
    await Project.deleteMany({ ownerId: userId });
    console.log(`Đã xóa các dự án cũ của user.`);

    const projects = [
      {
        name: 'Thiết kế website công ty',
        description: 'Dự án thiết kế và phát triển website doanh nghiệp với đầy đủ tính năng quản lý và bán hàng',
        status: PROJECT_STATUS.ACTIVE,
        startDate: moment().subtract(30, 'days').toDate(),
        endDate: moment().add(60, 'days').toDate(),
        ownerId: userId,
        isPersonal: false,
        createdAt: moment().subtract(30, 'days').toDate(),
        updatedAt: new Date()
      },
      {
        name: 'Phát triển ứng dụng di động',
        description: 'Xây dựng ứng dụng mobile cho khách hàng trên cả nền tảng iOS và Android',
        status: PROJECT_STATUS.ACTIVE,
        startDate: moment().subtract(15, 'days').toDate(),
        endDate: moment().add(45, 'days').toDate(),
        ownerId: userId,
        isPersonal: false,
        createdAt: moment().subtract(15, 'days').toDate(),
        updatedAt: new Date()
      },
      {
        name: 'Dự án cá nhân',
        description: 'Các công việc và nhiệm vụ cá nhân cần hoàn thành',
        status: PROJECT_STATUS.ACTIVE,
        startDate: moment().subtract(60, 'days').toDate(),
        endDate: moment().add(30, 'days').toDate(),
        ownerId: userId,
        isPersonal: true,
        createdAt: moment().subtract(60, 'days').toDate(),
        updatedAt: new Date()
      },
      {
        name: 'Bảo trì hệ thống',
        description: 'Dự án bảo trì và nâng cấp hệ thống hiện có',
        status: PROJECT_STATUS.COMPLETED,
        startDate: moment().subtract(90, 'days').toDate(),
        endDate: moment().subtract(15, 'days').toDate(),
        ownerId: userId,
        isPersonal: false,
        createdAt: moment().subtract(90, 'days').toDate(),
        updatedAt: moment().subtract(15, 'days').toDate()
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Đã tạo ${createdProjects.length} dự án cho user.`);
    return createdProjects;
  } catch (error) {
    console.error('❌ Lỗi khi tạo dự án:', error);
    throw error;
  }
};

/**
 * Tạo các task mẫu cho user và các dự án
 */
const seedTasks = async (projects) => {
  try {
    const userId = new mongoose.Types.ObjectId(USER_ID);
    console.log(`Tạo công việc cho user ${USER_ID}...`);

    // Xóa task cũ
    await Task.deleteMany({ 
      $or: [
        { assignedUserId: userId },
        { projectId: { $in: projects.map(p => p._id) } }
      ]
    });
    console.log(`Đã xóa các công việc cũ của user.`);

    // Tạo danh sách task cho các dự án
    const tasks = [];

    // Tasks cho dự án 1 - Website
    if (projects[0]) {
      tasks.push(
        {
          title: 'Thiết kế giao diện trang chủ',
          description: 'Thiết kế UI/UX cho trang chủ của website',
          status: TASK_STATUS.DONE,
          priority: TASK_PRIORITY.HIGH,
          dueDate: moment().subtract(15, 'days').toDate(),
          projectId: projects[0]._id,
          assignedUserId: userId,
          isPersonal: false,
          createdAt: moment().subtract(25, 'days').toDate(),
          updatedAt: moment().subtract(15, 'days').toDate()
        },
        {
          title: 'Phát triển frontend',
          description: 'Xây dựng giao diện người dùng theo thiết kế đã được phê duyệt',
          status: TASK_STATUS.IN_PROGRESS,
          priority: TASK_PRIORITY.MEDIUM,
          dueDate: moment().add(10, 'days').toDate(),
          projectId: projects[0]._id,
          assignedUserId: userId,
          isPersonal: false,
          createdAt: moment().subtract(20, 'days').toDate(),
          updatedAt: new Date()
        },
        {
          title: 'Phát triển backend',
          description: 'Xây dựng các API và kết nối cơ sở dữ liệu',
          status: TASK_STATUS.TODO,
          priority: TASK_PRIORITY.HIGH,
          dueDate: moment().add(20, 'days').toDate(),
          projectId: projects[0]._id,
          assignedUserId: userId,
          isPersonal: false,
          createdAt: moment().subtract(15, 'days').toDate(),
          updatedAt: new Date()
        }
      );
    }

    // Tasks cho dự án 2 - Mobile app
    if (projects[1]) {
      tasks.push(
        {
          title: 'Thiết kế UI cho ứng dụng',
          description: 'Thiết kế giao diện người dùng cho ứng dụng di động',
          status: TASK_STATUS.IN_PROGRESS,
          priority: TASK_PRIORITY.HIGH,
          dueDate: moment().add(5, 'days').toDate(),
          projectId: projects[1]._id,
          assignedUserId: userId,
          isPersonal: false,
          createdAt: moment().subtract(10, 'days').toDate(),
          updatedAt: new Date()
        },
        {
          title: 'Phát triển tính năng đăng nhập',
          description: 'Xây dựng tính năng đăng nhập và xác thực người dùng',
          status: TASK_STATUS.TODO,
          priority: TASK_PRIORITY.MEDIUM,
          dueDate: moment().add(15, 'days').toDate(),
          projectId: projects[1]._id,
          assignedUserId: userId,
          isPersonal: false,
          createdAt: moment().subtract(5, 'days').toDate(),
          updatedAt: new Date()
        }
      );
    }

    // Tasks cho dự án 3 - Cá nhân
    if (projects[2]) {
      tasks.push(
        {
          title: 'Học React Native',
          description: 'Hoàn thành khóa học React Native trên Udemy',
          status: TASK_STATUS.IN_PROGRESS,
          priority: TASK_PRIORITY.MEDIUM,
          dueDate: moment().add(14, 'days').toDate(),
          projectId: projects[2]._id,
          assignedUserId: userId,
          isPersonal: true,
          createdAt: moment().subtract(30, 'days').toDate(),
          updatedAt: new Date()
        },
        {
          title: 'Đọc sách Clean Code',
          description: 'Đọc và tóm tắt sách Clean Code',
          status: TASK_STATUS.DONE,
          priority: TASK_PRIORITY.LOW,
          dueDate: moment().subtract(10, 'days').toDate(),
          projectId: projects[2]._id,
          assignedUserId: userId,
          isPersonal: true,
          createdAt: moment().subtract(40, 'days').toDate(),
          updatedAt: moment().subtract(10, 'days').toDate()
        },
        {
          title: 'Chuẩn bị CV mới',
          description: 'Cập nhật CV với các kỹ năng và dự án mới',
          status: TASK_STATUS.TODO,
          priority: TASK_PRIORITY.HIGH,
          dueDate: moment().add(7, 'days').toDate(),
          projectId: projects[2]._id,
          assignedUserId: userId,
          isPersonal: true,
          createdAt: moment().subtract(5, 'days').toDate(),
          updatedAt: new Date()
        }
      );
    }

    // Tasks cho dự án 4 - Đã hoàn thành
    if (projects[3]) {
      tasks.push(
        {
          title: 'Cập nhật phiên bản database',
          description: 'Nâng cấp lên phiên bản mới nhất',
          status: TASK_STATUS.DONE,
          priority: TASK_PRIORITY.URGENT,
          dueDate: moment().subtract(20, 'days').toDate(),
          projectId: projects[3]._id,
          assignedUserId: userId,
          isPersonal: false,
          createdAt: moment().subtract(60, 'days').toDate(),
          updatedAt: moment().subtract(20, 'days').toDate()
        },
        {
          title: 'Sao lưu dữ liệu',
          description: 'Tạo bản sao lưu toàn bộ dữ liệu hệ thống',
          status: TASK_STATUS.DONE,
          priority: TASK_PRIORITY.HIGH,
          dueDate: moment().subtract(25, 'days').toDate(),
          projectId: projects[3]._id,
          assignedUserId: userId,
          isPersonal: false,
          createdAt: moment().subtract(70, 'days').toDate(),
          updatedAt: moment().subtract(25, 'days').toDate()
        }
      );
    }

    // Tasks không thuộc dự án nào
    tasks.push(
      {
        title: 'Họp nhóm hàng tuần',
        description: 'Tham gia cuộc họp team định kỳ',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.MEDIUM,
        dueDate: moment().add(2, 'days').toDate(),
        projectId: null,
        assignedUserId: userId,
        isPersonal: true,
        createdAt: moment().subtract(1, 'days').toDate(),
        updatedAt: new Date()
      },
      {
        title: 'Báo cáo công việc tháng',
        description: 'Tổng hợp và gửi báo cáo công việc hàng tháng',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.HIGH,
        dueDate: moment().add(5, 'days').toDate(),
        projectId: null,
        assignedUserId: userId,
        isPersonal: true,
        createdAt: moment().subtract(2, 'days').toDate(),
        updatedAt: new Date()
      }
    );

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Đã tạo ${createdTasks.length} công việc cho user.`);
    return createdTasks;
  } catch (error) {
    console.error('❌ Lỗi khi tạo công việc:', error);
    throw error;
  }
};

/**
 * Chạy tất cả seeds
 */
const runSeeds = async () => {
  try {
    console.log('⏳ Bắt đầu tạo dữ liệu mẫu...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task_management');
    console.log('📦 Đã kết nối MongoDB');
    
    // Tạo dữ liệu theo thứ tự: projects -> tasks
    const projects = await seedProjects();
    await seedTasks(projects);

    console.log('✅ Đã hoàn thành tạo dữ liệu mẫu!');
    return { success: true };
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
    return { success: false, error: error.message };
  } finally {
    mongoose.connection.close();
  }
};

// Nếu chạy trực tiếp file này
if (require.main === module) {
  runSeeds()
    .then(() => {
      console.log('🎉 Đã hoàn thành tạo dữ liệu mẫu!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Lỗi:', err);
      process.exit(1);
    });
}

module.exports = { runSeeds }; 