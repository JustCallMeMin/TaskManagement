const express = require("express");
const UserController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy danh sách User (chỉ Admin mới có quyền)
router.get(
	"/",
	authenticate,
	authorize(["Manage Users"]),
	UserController.getAllUsers
);

// Tìm kiếm người dùng theo tên hoặc email (yêu cầu xác thực, nhưng không yêu cầu quyền Manage Users)
// Dùng cho chức năng mời thành viên vào dự án
router.get(
	"/search",
	authenticate,
	UserController.searchUsers
);

// Gán vai trò cho User (chỉ Admin mới có quyền)
router.post(
	"/assign-role",
	authenticate,
	authorize(["Manage Users"]),
	UserController.assignRole
);

module.exports = router;
