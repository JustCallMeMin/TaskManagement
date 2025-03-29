const express = require("express");
const ProjectController = require("../controllers/project.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const {
	validateCreateProject,
	validateUpdateProject,
	validateAddMembers,
	validateRemoveMembers,
	validateDeleteProjects,
} = require("../middlewares/validate.middleware");

const router = express.Router();

// 🚀 Hệ thống tự động tạo Personal Project khi User đăng ký (Không cần endpoint)

// 🔹 Tạo Organization Project (Chỉ Manager & Admin)
router.post(
	"/organization",
	authenticate,
	authorize(["Create Project"]),
	validateCreateProject,
	ProjectController.createOrganizationProject
);

// 🔹 Cập nhật Project (Chỉ Manager của dự án hoặc Admin)
router.put(
	"/:projectId",
	authenticate,
	authorize(["Edit Project"]),
	validateUpdateProject,
	ProjectController.updateProject
);

// 🔹 Xóa Project (Chỉ Admin, chỉ xóa nếu không có Task đang thực hiện)
router.delete(
	"/:projectId",
	authenticate,
	authorize(["Delete Project"]),
	validateDeleteProjects,
	ProjectController.deleteProjects
);

// 🔹 Lấy danh sách Project của User (bao gồm Personal & Organization Project)
router.get("/", authenticate, ProjectController.getAllProjects);

// 🔹 Lấy thông tin chi tiết Project
router.get("/:projectId", authenticate, ProjectController.getProjectById);

// 🔹 Thêm thành viên vào Organization Project (Chỉ Manager & Admin)
router.post(
	"/:projectId/members",
	authenticate,
	authorize(["Manage Project Members"]),
	validateAddMembers,
	ProjectController.addMembers
);

// 🔹 Xóa thành viên khỏi Organization Project (Chỉ Manager & Admin)
router.delete(
	"/:projectId/members",
	authenticate,
	authorize(["Manage Project Members"]),
	validateRemoveMembers,
	ProjectController.removeMembers
);

// 🔹 Lấy danh sách thành viên của dự án
router.get(
	"/:projectId/members",
	authenticate,
	ProjectController.getProjectMembers
);

module.exports = router;
