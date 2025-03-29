const mongoose = require('mongoose');
const Permission = require('../../models/permission.model');
const Role = require('../../models/role.model');
const RolePermission = require('../../models/role_permission.model');

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
  Manager: [
    "Update Profile",
    "Create Project",
    "Edit Project",
    "Manage Project Members",
    "Create Personal Task",
    "Create Project Task",
    "Assign Task",
    "Edit Task",
    "Delete Task",
    "Change Task Status",
    "View Reports",
  ],
  User: ["Update Profile", "Create Personal Task", "Change Task Status"],
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

module.exports = seedPermissions;

// Nếu chạy trực tiếp file này
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedPermissions();
    })
    .then(() => {
      console.log('Permission seeding completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during permission seeding:', err);
      process.exit(1);
    });
} 