const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE } = require('../../utils/enums');
const Role = require('../../models/role.model');
const Permission = require('../../models/permission.model');
const RolePermission = require('../../models/role_permission.model');
const User = require('../../models/user.model');
const UserRole = require('../../models/user_role.model');
require('dotenv').config();

// Danh sách permissions
const permissions = [
  // ✅ QUẢN LÝ NGƯỜI DÙNG (AUTHENTICATION)
  { permissionName: "Manage Users" }, // Quản lý người dùng (Admin)
  { permissionName: "Reset Passwords" }, // Reset mật khẩu người dùng
  { permissionName: "Update Profile" }, // Cập nhật thông tin cá nhân

  // ✅ QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT)
  { permissionName: "Create Project" }, // Tạo dự án mới (Manager/Admin)
  { permissionName: "Edit Project" }, // Chỉnh sửa thông tin dự án
  { permissionName: "Delete Project" }, // Xóa dự án (Admin)
  { permissionName: "Manage Project Members" }, // Quản lý thành viên dự án

  // ✅ QUẢN LÝ CÔNG VIỆC (TASK MANAGEMENT)
  { permissionName: "Create Personal Task" }, // Tạo task cá nhân (User)
  { permissionName: "Create Project Task" }, // Tạo task trong dự án (Manager/Admin)
  { permissionName: "Assign Task" }, // Giao task cho thành viên
  { permissionName: "Edit Task" }, // Chỉnh sửa task
  { permissionName: "Delete Task" }, // Xóa task (Admin/Manager)
  { permissionName: "Change Task Status" }, // Cập nhật trạng thái task

  // ✅ QUẢN LÝ BÁO CÁO & THỐNG KÊ
  { permissionName: "View Reports" }, // Xem báo cáo công việc (Manager/Admin)
  { permissionName: "Generate Reports" }, // Tạo báo cáo (Admin)

  // ✅ QUẢN LÝ HỆ THỐNG
  { permissionName: "Manage System Settings" }, // Cấu hình hệ thống (Admin)

  // ✅ QUẢN LÝ 2FA
  { permissionName: "Manage 2FA" },
];

// Mapping quyền cho từng role
const rolePermissionsMap = {
  Admin: [
    "Manage Users",
    "Reset Passwords",
    "Update Profile",
    "Create Project",
    "Edit Project",
    "Delete Project",
    "Manage Project Members",
    "Create Personal Task",
    "Create Project Task",
    "Assign Task",
    "Edit Task",
    "Delete Task",
    "Change Task Status",
    "View Reports",
    "Generate Reports",
    "Manage System Settings",
    "Manage 2FA",
  ],
  User: ["Update Profile", "Create Personal Task", "Change Task Status"],
};

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

// Hàm gán permissions cho role
const assignPermissionsToRole = async (roleName, permissionNames) => {
  const role = await Role.findOne({ roleName });
  if (!role) {
    console.error(`❌ Không tìm thấy role: ${roleName}`);
    return;
  }

  const permissionObjects = await Permission.find({
    permissionName: { $in: permissionNames },
  });

  // Kiểm tra các quyền đã được gán cho role chưa
  const existingRolePermissions = await RolePermission.find({ roleId: role._id });
  const existingPermissionIds = existingRolePermissions.map(rp => rp.permissionId.toString());

  // Lọc ra các quyền chưa được gán
  const newPermissions = permissionObjects.filter(permission => 
    !existingPermissionIds.includes(permission._id.toString())
  );

  if (newPermissions.length === 0) {
    console.log(`✅ Tất cả quyền đã được gán cho role ${roleName}`);
    return;
  }

  const rolePermissions = newPermissions.map((permission) => ({
    roleId: role._id,
    permissionId: permission._id,
  }));

  await RolePermission.insertMany(rolePermissions);
  console.log(`✅ Đã gán ${newPermissions.length} quyền mới cho role ${roleName}`);
};

/**
 * Khởi tạo permissions và gán cho roles
 */
const seedPermissions = async () => {
  try {
    // Kiểm tra xem đã có permissions chưa
    const existingPermissions = await Permission.find();
    
    if (existingPermissions.length === 0) {
      // Tạo permissions
      await Permission.insertMany(permissions);
      console.log("✅ Đã tạo permissions thành công!");
    } else {
      // Thêm permissions mới nếu có
      const existingPermissionNames = existingPermissions.map(p => p.permissionName);
      const newPermissions = permissions.filter(p => !existingPermissionNames.includes(p.permissionName));
      
      if (newPermissions.length > 0) {
        await Permission.insertMany(newPermissions);
        console.log(`✅ Đã thêm ${newPermissions.length} permissions mới!`);
      } else {
        console.log("✅ Tất cả permissions đã tồn tại.");
      }
    }

    // Gán permissions cho từng role
    for (const [roleName, permissionNames] of Object.entries(rolePermissionsMap)) {
      await assignPermissionsToRole(roleName, permissionNames);
    }
    
    return {
      permissions: await Permission.find(),
      rolePermissions: await RolePermission.find()
    };
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo permissions:", error);
    throw error;
  }
};

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

/**
 * Run all initial seeds
 */
const runInitialSeeds = async () => {
  try {
    console.log('⏳ Đang chạy initial seeds...');
    
    // Chạy theo thứ tự: roles -> permissions -> admin
    await seedRoles();
    await seedPermissions();
    await seedAdmin();

    console.log('✅ Đã hoàn thành initial seeds!');
  } catch (error) {
    console.error('❌ Lỗi khi chạy initial seeds:', error);
    throw error;
  }
};

module.exports = { runInitialSeeds };

// Nếu chạy trực tiếp file này
if (require.main === module) {
  // Kết nối đúng tên database với giá trị mặc định
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task_management')
    .then(() => {
      console.log('📦 Đã kết nối MongoDB');
      return runInitialSeeds();
    })
    .then(() => {
      console.log('🎉 Initial seeding completed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Lỗi:', err);
      process.exit(1);
    });
} 