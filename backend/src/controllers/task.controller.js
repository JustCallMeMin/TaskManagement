const TaskService = require("../domain/services/task.service");
const { successResponse, errorResponse } = require("../utils/response");

class TaskController {
	static async createPersonalTask(req, res) {
		try {
			const task = await TaskService.createTask(req.user.id, {
				...req.body,
				isPersonal: true
			});
			return successResponse(res, task, "Task cá nhân đã được tạo thành công.", 201);
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}

	static async createProjectTask(req, res) {
		try {
			if (!req.body.projectId) {
				return errorResponse(res, "Project ID is required for project tasks");
			}
			
			const task = await TaskService.createTask(req.user.id, {
				...req.body,
				isPersonal: false,
			});
			return successResponse(res, task, "Task dự án đã được tạo thành công.", 201);
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}

	static async updateTask(req, res) {
		try {
			const taskId = req.params.taskId;
			const userId = req.user.id;
			const updateData = req.body;

			console.log('Update Task Debug:', {
				userId,
				userPermissions: req.user.permissions,
				taskId,
				updateData
			});

			// Get the task first
			const task = await TaskService.getTaskById(taskId);
			if (!task) {
				return errorResponse(res, "Không tìm thấy công việc.", 404);
			}

			console.log('Task Data:', {
				taskCreator: task.createdBy,
				taskAssignee: task.assignedUserId,
				userId,
				isCreator: task.createdBy === userId,
				isAssignee: task.assignedUserId === userId,
				hasPermission: req.user.permissions?.includes("Edit Task")
			});

			// Check permissions - using string comparison since getTaskById returns string IDs
			const canEdit = 
				task.createdBy === userId || // Creator
				task.assignedUserId === userId || // Assignee
				req.user.permissions?.includes("Edit Task"); // Has permission

			console.log('Permission check result:', { canEdit });

			if (!canEdit) {
				return errorResponse(res, "Không có quyền thực hiện hành động này.", 403);
			}

			// Proceed with update
			const updatedTask = await TaskService.updateTask(taskId, updateData);
			return successResponse(res, updatedTask, "Cập nhật công việc thành công.");
		} catch (error) {
			console.error('Update Task Error:', error);
			return errorResponse(res, error.message);
		}
	}

	static async deleteTask(req, res) {
		try {
			const { taskId } = req.params;
			await TaskService.deleteTask(taskId, req.user.id);
			return successResponse(res, null, "Xóa công việc thành công.", 204);
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}

	static async getAllTasks(req, res) {
		try {
			// Get query parameters
			const { projectId } = req.query;
			const userId = req.user.id;
			
			// Different responses based on whether projectId is provided
			let tasks;
			let message;
			
			if (projectId) {
				// Get tasks for specific project
				console.log(`Fetching tasks for project: ${projectId}`);
				tasks = await TaskService.getTasksByProject(projectId, userId);
				message = tasks.length > 0
					? `Danh sách công việc của dự án.`
					: "Dự án chưa có công việc nào.";
			} else {
				// Get all tasks for user (across all projects)
				console.log(`Fetching all tasks for user: ${userId}`);
				tasks = await TaskService.getAllTasks(userId);
				message = tasks.length > 0
					? "Danh sách công việc của bạn."
					: "Bạn chưa có công việc nào.";
			}
			
			return successResponse(res, tasks, message);
		} catch (error) {
			console.error('Error in getAllTasks:', error);
			return errorResponse(res, "Không thể lấy danh sách công việc.");
		}
	}

	static async getTaskById(req, res) {
		try {
			const { taskId } = req.params;
			const task = await TaskService.getTaskById(taskId, req.user.id);
			return successResponse(res, task, "Chi tiết công việc.");
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}

	static async updateTaskStatus(req, res) {
		try {
			const { taskId } = req.params;
			const { status } = req.body;
			const updatedTask = await TaskService.updateTaskStatus(taskId, req.user.id, status);
			return successResponse(res, updatedTask, "Cập nhật trạng thái thành công.");
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}

	static async assignTask(req, res) {
		try {
			const { taskId } = req.params;
			const { assignedUserId } = req.body;
			const updatedTask = await TaskService.assignTask(taskId, req.user.id, assignedUserId);
			return successResponse(res, updatedTask, "Gán công việc thành công.");
		} catch (error) {
			return errorResponse(res, error.message);
		}
	}
}

module.exports = TaskController;
