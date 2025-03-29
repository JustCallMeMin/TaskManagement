const TaskService = require("../domain/services/task.service");

class TaskController {
	static async createPersonalTask(req, res) {
		try {
			const task = await TaskService.createTask(req.user.id, {
				...req.body,
				isPersonal: true,
			});
			res.status(201).json(task);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	static async createProjectTask(req, res) {
		try {
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
			const updatedTask = await TaskService.updateTask(
				taskId,
				req.user.id,
				req.body
			);
			res.status(200).json(updatedTask);
		} catch (error) {
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
			res.status(200).json(tasks);
		} catch (error) {
			res.status(400).json({ error: error.message });
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
