const TaskRepository = require("../repositories/task.repository");
const ProjectRepository = require("../repositories/project.repository");
const ProjectService = require("./project.service");
const UserRepository = require("../repositories/user.repository");
const { TASK_STATUS, PROJECT_STATUS } = require("../../utils/enums");
const TaskDTO = require("../dto/task.dto");

class TaskService {
	// 🔹 Tạo Task mới
	static async createTask(userId, taskData) {
		const { title, description, dueDate, priority, projectId, assignedUserId } =
			taskData;

		// Kiểm tra người tạo task có tồn tại không
		const user = await UserRepository.findById(userId);
		if (!user) throw new Error("Người dùng không tồn tại.");

		let project;

		// Kiểm tra project tồn tại nếu có projectId
		if (projectId) {
			project = await ProjectRepository.findById(projectId);
		}

		// Nếu không có projectId hoặc project không tồn tại, tạo Personal Project
		if (!project) {
			console.log("🔍 Tìm Personal Project cho user:", userId);
			project = await ProjectRepository.findByOwner(userId, true);
			console.log("📌 Kết quả tìm Personal Project:", project);

			const startDate = new Date();
			const taskDueDate = dueDate
				? new Date(dueDate)
				: new Date(startDate.getFullYear(), 11, 31);

			if (!project) {
				try {
					console.log("🚀 Bắt đầu tạo Personal Project...");
					// Tạo mới Personal Project
					const projectData = {
						name: "Personal Tasks",
						description: "Your personal task list",
						ownerId: userId,
						isPersonal: true,
						status: PROJECT_STATUS.IN_PROGRESS,
						startDate: startDate,
						endDate: taskDueDate,
					};
					console.log("📝 Data tạo Personal Project:", projectData);

					project = await ProjectRepository.create(projectData);
					console.log("✅ Đã tạo Personal Project thành công:", project);
				} catch (error) {
					console.error("❌ Lỗi khi tạo Personal Project:", error);
					throw new Error(`Không thể tạo Personal Project: ${error.message}`);
				}
			} else if (dueDate) {
				console.log("🔄 Cập nhật endDate của Personal Project");
				// Cập nhật endDate của Personal Project nếu task mới có dueDate xa hơn
				const currentEndDate = new Date(project.endDate);
				if (taskDueDate > currentEndDate) {
					project = await ProjectRepository.update(project._id, {
						endDate: taskDueDate,
					});
					console.log("✅ Đã cập nhật endDate của Personal Project:", project);
				}
			}
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
		});

		return new TaskDTO(task);
	}

	// 🔹 Cập nhật Task
	static async updateTask(taskId, userId, taskData) {
		const task = await TaskRepository.findById(taskId);
		if (!task) throw new Error("Task không tồn tại.");

		if (task.assignedUserId.toString() !== userId) {
			throw new Error("Bạn không có quyền cập nhật task này.");
		}

		const updatedTask = await TaskRepository.update(taskId, taskData);
		return updatedTask;
	}

	// 🔹 Xóa Task
	static async deleteTask(taskId, userId) {
		const task = await TaskRepository.findById(taskId);
		if (!task) throw new Error("Task không tồn tại.");

		if (task.assignedUserId.toString() !== userId) {
			throw new Error("Bạn không có quyền xóa task này.");
		}

		await TaskRepository.delete(taskId);
		return { message: "Đã xóa task thành công." };
	}

	// 🔹 Lấy danh sách Task của User
	static async getAllTasks(userId) {
		const tasks = await TaskRepository.findByUser(userId);
		return tasks;
	}

	// 🔹 Lấy chi tiết Task
	static async getTaskById(taskId, userId) {
		const task = await TaskRepository.findById(taskId);
		if (!task) throw new Error("Task không tồn tại.");

		if (task.assignedUserId.toString() !== userId) {
			throw new Error("Bạn không có quyền xem task này.");
		}

		return task;
	}
}

module.exports = TaskService;
