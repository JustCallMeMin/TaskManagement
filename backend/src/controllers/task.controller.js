const TaskService = require("../domain/services/task.service");

class TaskController {
	static async createPersonalTask(req, res) {
		try {
			const task = await TaskService.createTask(req.user.id, {
				...req.body,
				isPersonal: true,
				projectId: null,
			});
			res.status(201).json(task);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async createProjectTask(req, res) {
		try {
			if (!req.body.projectId) {
				return res.status(400).json({ error: "Project ID is required for project tasks" });
			}
			
			const task = await TaskService.createTask(req.user.id, {
				...req.body,
				isPersonal: false,
			});
			res.status(201).json(task);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async updateTask(req, res) {
		try {
			const { taskId } = req.params;
			console.log("🔍 Attempting to update task:", taskId);
			console.log("🔍 Request body:", JSON.stringify(req.body));
			
			const updatedTask = await TaskService.updateTask(
				taskId,
				req.user.id,
				req.body
			);
			console.log("✅ Task updated successfully");
			res.status(200).json(updatedTask);
		} catch (error) {
			console.error("❌ Error updating task:", error.message);
			res.status(400).json({ error: error.message });
		}
	}

	static async deleteTask(req, res) {
		try {
			const { taskId } = req.params;
			await TaskService.deleteTask(taskId, req.user.id);
			res.status(204).send();
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllTasks(req, res) {
		try {
			const tasks = await TaskService.getAllTasks(req.user.id);
			return res.status(200).json(tasks || []);
		} catch (error) {
			return res.status(400).json({ error: error.message });
		}
	}

	static async getTaskById(req, res) {
		try {
			const { taskId } = req.params;
			const task = await TaskService.getTaskById(taskId, req.user.id);
			res.status(200).json(task);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async updateTaskStatus(req, res) {
		try {
			const { taskId } = req.params;
			const { status } = req.body;
			const updatedTask = await TaskService.updateTaskStatus(
				taskId,
				req.user.id,
				status
			);
			res.status(200).json(updatedTask);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async assignTask(req, res) {
		try {
			const { taskId } = req.params;
			const { assignedUserId } = req.body;
			const updatedTask = await TaskService.assignTask(
				taskId,
				req.user.id,
				assignedUserId
			);
			res.status(200).json(updatedTask);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}
}

module.exports = TaskController;
