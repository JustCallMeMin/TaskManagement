const TaskRepository = require("../repositories/task.repository");
const ProjectRepository = require("../repositories/project.repository");
const ProjectService = require("./project.service");
const UserRepository = require("../repositories/user.repository");
const { TASK_STATUS, PROJECT_STATUS } = require("../../utils/enums");
const TaskDTO = require("../dto/task.dto");
const mongoose = require("mongoose");

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
	static async updateTask(taskId, updateData) {
		try {
			// Validate task exists
			const task = await TaskRepository.findById(taskId);
			if (!task) {
				throw new Error("Không tìm thấy công việc.");
			}

			// Update task
			const updatedTask = await TaskRepository.update(taskId, updateData);
			if (!updatedTask) {
				throw new Error("Cập nhật công việc thất bại.");
			}

			return updatedTask;
		} catch (error) {
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

	// 🔹 Lấy tasks theo Project
	static async getTasksByProject(projectId, userId) {
		try {
			console.log(`🔍 Getting tasks for project: ${projectId} and user: ${userId}`);
			
			// Check if project exists
			const project = await ProjectRepository.findById(projectId);
			if (!project) {
				console.warn(`Project not found: ${projectId}`);
				return [];
			}
			
			// Log the project structure to debug
			console.log(`🔍 Project data:`, {
				id: project._id,
				owner: project.owner,
				ownerId: project.ownerId,
				members: project.members,
				isPersonal: project.isPersonal
			});
			
			// Check if user has access to this project - improved with more checks
			let isOwner = false;
			
			// Check owner - could be direct ID or nested object
			if (project.ownerId) {
				const ownerIdString = typeof project.ownerId === 'object' ? 
					(project.ownerId._id ? String(project.ownerId._id) : null) : 
					String(project.ownerId);
				
				isOwner = ownerIdString === String(userId);
				console.log(`🔍 Owner check: project.ownerId=${ownerIdString}, userId=${userId}, isOwner=${isOwner}`);
			}
			
			// Improved member check with detailed logging
			let isMember = false;
			
			// If we have members array, check all possible structures
			if (project.members && Array.isArray(project.members)) {
				console.log(`🔍 Checking if user ${userId} is a member of project ${projectId}`);
				console.log(`🔍 Project has ${project.members.length} members`);
				
				for (const member of project.members) {
					console.log(`🔍 Checking member:`, JSON.stringify(member));
					
					// Direct member ID check
					if (typeof member === 'string' || member instanceof mongoose.Types.ObjectId) {
						if (String(member) === String(userId)) {
							isMember = true;
							console.log(`🔍 Found user as direct member`);
							break;
						}
					} 
					// ProjectUser object with userId field
					else if (member && typeof member === 'object') {
						// Check if userId is a direct match
						if (member.userId && (
							   String(member.userId) === String(userId) ||
							   (member.userId._id && String(member.userId._id) === String(userId))
						   )) {
							isMember = true;
							console.log(`🔍 Found user in member.userId field`);
							break;
						}
						
						// Check user ID in nested objects (handles different structures)
						const checkNestedUserId = (obj) => {
							if (!obj || typeof obj !== 'object') return false;
							
							// Direct ID match
							if (obj._id && String(obj._id) === String(userId)) return true;
							if (obj.id && String(obj.id) === String(userId)) return true;
							
							// Check in userId field if it exists
							if (obj.userId) {
								if (typeof obj.userId === 'string' || obj.userId instanceof mongoose.Types.ObjectId) {
									return String(obj.userId) === String(userId);
								} else if (typeof obj.userId === 'object') {
									return (obj.userId._id && String(obj.userId._id) === String(userId)) ||
										   (obj.userId.id && String(obj.userId.id) === String(userId));
								}
							}
							
							return false;
						};
						
						if (checkNestedUserId(member)) {
							isMember = true;
							console.log(`🔍 Found user in nested member object`);
							break;
						}
					}
				}
			}
			
			console.log(`🔍 Access check results: isOwner = ${isOwner}, isMember = ${isMember}`);
			
			// Grant access if user is either owner or member
			if (isOwner || isMember || project.isPersonal) {
				console.log(`🔍 User ${userId} has access to project ${projectId}`);
				
				// Find all tasks for this project
				const tasks = await TaskRepository.findByProjectId(projectId);
				console.log(`🔍 Found ${tasks.length} tasks for project ${projectId}`);
				
				// Map each task to a DTO to ensure consistent formatting
				return tasks.map(task => new TaskDTO(task)) || [];
			} else {
				console.warn(`User ${userId} does not have access to project ${projectId}`);
				return [];
			}
		} catch (error) {
			console.error(`Error fetching tasks for project ${projectId}:`, error);
			return [];
		}
	}

	// 🔹 Lấy chi tiết Task
	static async getTaskById(taskId) {
		try {
			console.log('Getting task by ID:', taskId);
			
			const task = await TaskRepository.findById(taskId);
			if (!task) {
				throw new Error("Task không tồn tại.");
			}

			console.log('Found task:', {
				id: task._id,
				createdBy: task.createdBy,
				assignedUserId: task.assignedUserId
			});

			// Ensure we return a plain object with string IDs
			const taskData = task.toObject();
			taskData.id = taskData._id.toString();
			taskData.createdBy = taskData.createdBy.toString();
			if (taskData.assignedUserId) {
				taskData.assignedUserId = taskData.assignedUserId.toString();
			}

			return taskData;
		} catch (error) {
			console.error('Error in getTaskById:', error);
			throw error;
		}
	}
}

module.exports = TaskService;
