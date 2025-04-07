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

    static async findPersonalTasks(userId) {
        return Task.find({ 
            assignedUserId: userId,
            isPersonal: true
        });
    }

    static async findProjectTasks(userId, projectId = null) {
        const query = { 
            assignedUserId: userId,
            isPersonal: false
        };
        
        if (projectId) {
            query.projectId = projectId;
        }
        
        return Task.find(query);
    }

    static async update(taskId, updatedData) {
        return Task.findByIdAndUpdate(
            taskId, 
            updatedData, 
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        );
    }

    static async delete(taskId) {
        return Task.findByIdAndDelete(taskId);
    }
}

module.exports = TaskRepository;