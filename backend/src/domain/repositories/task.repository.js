const Task = require("../../models/task.model");

class TaskRepository {
    static async create(taskData) {
        return Task.create(taskData);
    }

    static async findById(taskId) {
        return Task.findById(taskId);
    }

    static async findByUser(userId) {
        return Task.find({ assignedUserId: userId });
    }

    static async update(taskId, updatedData) {
        return Task.findByIdAndUpdate(taskId, updatedData, { new: true });
    }

    static async delete(taskId) {
        return Task.findByIdAndDelete(taskId);
    }
}

module.exports = TaskRepository;