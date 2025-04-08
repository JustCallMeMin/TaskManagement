const TaskRepository = require("../repositories/task.repository");
const ProjectRepository = require("../repositories/project.repository");
const ProjectService = require("./project.service");
const UserRepository = require("../repositories/user.repository");
const { TASK_STATUS, PROJECT_STATUS } = require("../../utils/enums");
const TaskDTO = require("../dto/task.dto");

/**
 * TaskService - Quản lý nghiệp vụ công việc
 * 
 * Theo mô hình Jira/Trello:
 * - Mỗi User có một Personal Project riêng
 * - Tất cả Task cá nhân đều thuộc Personal Project này
 * - Task dự án thuộc về các Organization Project do Manager/Admin tạo
 */
class TaskService {
	// 🔹 Tạo Task mới
	static async createTask(userId, taskData) {
		const { title, description, dueDate, priority, projectId, assignedUserId, isPersonal } = taskData;

		// Kiểm tra người tạo task có tồn tại không
		const user = await UserRepository.findById(userId);
		if (!user) throw new Error("Người dùng không tồn tại.");

		// Handle personal tasks (tasks without a project)
		if (isPersonal || !projectId) {
			// Check if user has a personal project
			const personalProject = await ProjectService.getOrCreatePersonalProject(userId);
			
			// If no personal project exists and user is trying to create a personal task,
			// we should create a personal project first
			if (!personalProject) {
				// Create a new personal project for this user
				const newPersonalProject = await ProjectService.createPersonalProject(userId);
				if (!newPersonalProject) {
					throw new Error("Không thể tạo project cá nhân.");
				}
				
				// Create task with the newly created personal project ID
				const task = await TaskRepository.create({
					title,
					description,
					dueDate,
					priority,
					projectId: newPersonalProject._id,
					assignedUserId: assignedUserId || userId,
					status: TASK_STATUS.TODO,
					isPersonal: true,
					createdBy: userId,
				});

				return new TaskDTO(task);
			}
			
			// Use existing personal project
			const task = await TaskRepository.create({
				title,
				description,
				dueDate,
				priority,
				projectId: personalProject._id,
				assignedUserId: assignedUserId || userId,
				status: TASK_STATUS.TODO,
				isPersonal: true,
				createdBy: userId,
			});

			return new TaskDTO(task);
		}

		// From here, handle project-based tasks (Organization Projects)
		let project;

		// Kiểm tra project tồn tại
		project = await ProjectRepository.findById(projectId);
		if (!project) {
			throw new Error("Dự án không tồn tại.");
		}

		// Kiểm tra dueDate nằm trong khoảng thời gian của project
		if (dueDate && project.startDate && project.endDate) {
			const taskDueDate = new Date(dueDate);
			const projectStartDate = new Date(project.startDate);
			const projectEndDate = new Date(project.endDate);

			if (taskDueDate < projectStartDate || taskDueDate > projectEndDate) {
				throw new Error(
					"Ngày hết hạn của task phải nằm trong khoảng thời gian của dự án."
				);
			}
		}

		// Kiểm tra assignedUserId hợp lệ không
		if (assignedUserId) {
			const assignedUser = await UserRepository.findById(assignedUserId);
			if (!assignedUser) throw new Error("Người được giao không tồn tại.");
		}

		// Tạo task mới
		const task = await TaskRepository.create({
			title,
			description,
			dueDate,
			priority,
			projectId: project._id,
			assignedUserId: assignedUserId || userId,
			status: TASK_STATUS.TODO,
			isPersonal: false, // Mark explicitly as NOT personal
			createdBy: userId, // Explicitly set creator
		});

		return new TaskDTO(task);
	}

	// 🔹 Cập nhật Task
	static async updateTask(taskId, userId, taskData) {
		console.log("🔍 Service: Updating task:", taskId);
		console.log("🔍 Service: Update data:", JSON.stringify(taskData));
		
		const task = await TaskRepository.findById(taskId);
		if (!task) {
			console.error("❌ Service: Task not found");
			throw new Error("Task không tồn tại.");
		}

		// Log the full task and user ID for debugging
		console.log("🔍 Service: Task data:", JSON.stringify(task));
		console.log("🔍 Service: Current user ID:", userId);
		console.log("🔍 Service: Task assignedUserId:", task.assignedUserId?.toString());

		// Allow updating if user created the task or is assigned to it
		// Use optional chaining and String() to safely convert IDs to strings
		const isCreator = task.createdBy ? String(task.createdBy) === String(userId) : false;
		const isAssigned = task.assignedUserId ? String(task.assignedUserId) === String(userId) : false;
		
		console.log("🔍 Service: User permissions check - isCreator:", isCreator, "isAssigned:", isAssigned);
		
		// Let creator or assigned user update the task
		if (!isCreator && !isAssigned) {
			console.error("❌ Service: User lacks permission to update task");
			throw new Error("Bạn không có quyền cập nhật task này.");
		}

		try {
			const updatedTask = await TaskRepository.update(taskId, taskData);
			console.log("✅ Service: Task updated successfully");
			return updatedTask;
		} catch (error) {
			console.error("❌ Service: Error in repository update:", error.message);
			throw error;
		}
	}

	// 🔹 Xóa Task
	static async deleteTask(taskId, userId) {
		const task = await TaskRepository.findById(taskId);
		if (!task) throw new Error("Task không tồn tại.");

		// Allow deleting if user created the task or is assigned to it
		// Use the same string comparison for consistent behavior
		const isCreator = task.createdBy ? String(task.createdBy) === String(userId) : false;
		const isAssigned = task.assignedUserId ? String(task.assignedUserId) === String(userId) : false;
		
		if (!isCreator && !isAssigned) {
			throw new Error("Bạn không có quyền xóa task này.");
		}

		await TaskRepository.delete(taskId);
		return { message: "Đã xóa task thành công." };
	}

	// 🔹 Lấy danh sách Task của User
	static async getAllTasks(userId) {
		try {
			console.log(`🔍 Getting tasks for user: ${userId}`);
			const tasks = await TaskRepository.findByUser(userId);
			console.log(`🔍 Found ${tasks.length} tasks`);
			
			// Map each task to a DTO to ensure consistent formatting
			// Always return an array, even if empty
			return tasks.map(task => new TaskDTO(task)) || [];
		} catch (error) {
			console.error("Error fetching tasks:", error);
			// Never throw an error, always return empty array for graceful empty states
			return [];
		}
	}

	// 🔹 Lấy chi tiết Task
	static async getTaskById(taskId, userId) {
		const task = await TaskRepository.findById(taskId);
		if (!task) throw new Error("Task không tồn tại.");

		// Allow any authenticated user to view task details
		// Remove the restriction that only allows assigned users to view tasks
		// if (task.assignedUserId.toString() !== userId) {
		//   throw new Error("Bạn không có quyền xem task này.");
		// }

		return task;
	}
}

module.exports = TaskService;
