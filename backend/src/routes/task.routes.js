const express = require("express");
const TaskController = require("../controllers/task.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const {
	validateCreateTask,
	validateUpdateTask,
	validateTaskId,
} = require("../middlewares/validate.middleware");

const router = express.Router();

// 🔹 Tạo công việc cá nhân
router.post(
	"/personal",
	authenticate,
	authorize(["Create Personal Task"]),
	validateCreateTask,
	TaskController.createPersonalTask
);

// 🔹 Tạo công việc trong dự án
router.post(
	"/project",
	authenticate,
	authorize(["Create Project Task"]),
	validateCreateTask,
	TaskController.createProjectTask
);

// 🔹 Cập nhật công việc
router.put(
	"/:taskId",
	authenticate,
	authorize(["Edit Task"]),
	validateTaskId,
	validateUpdateTask,
	TaskController.updateTask
);

// 🔹 Xóa công việc
router.delete(
	"/:taskId",
	authenticate,
	authorize(["Delete Task"]),
	validateTaskId,
	TaskController.deleteTask
);

// 🔹 Cập nhật trạng thái công việc
router.patch(
	"/:taskId/status",
	authenticate,
	authorize(["Change Task Status"]),
	validateTaskId,
	TaskController.updateTaskStatus
);

// 🔹 Gán công việc cho người dùng
router.patch(
	"/:taskId/assign",
	authenticate,
	authorize(["Assign Task"]),
	validateTaskId,
	TaskController.assignTask
);

// 🔹 Lấy danh sách công việc
router.get("/", authenticate, TaskController.getAllTasks);

// 🔹 Lấy chi tiết công việc
router.get(
	"/:taskId",
	authenticate,
	validateTaskId,
	TaskController.getTaskById
);

module.exports = router;
