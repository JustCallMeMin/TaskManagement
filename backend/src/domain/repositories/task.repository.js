const Task = require("../../models/task.model");

class TaskRepository {
    static async create(taskData) {
        return Task.create(taskData);
    }

    static async findById(taskId) {
        return Task.findById(taskId);
    }

    static async findByUser(userId) {
        return Task.find({
            $or: [
                { assignedUserId: userId },
                { createdBy: userId }
            ]
        });
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
    
    static async findByProjectId(projectId) {
        const mongoose = require('mongoose');
        let query = {};
        
        try {
            // Nếu projectId là string hợp lệ, chuyển thành ObjectId
            if (mongoose.Types.ObjectId.isValid(projectId)) {
                query.projectId = new mongoose.Types.ObjectId(projectId);
            } else {
                // Nếu không phải ID hợp lệ, giữ nguyên để đảm bảo không match với bất kỳ task nào
                query.projectId = projectId;
            }
            
            console.log(`Querying tasks with projectId: ${projectId}, converted to: ${JSON.stringify(query)}`);
            return Task.find(query).sort({ createdAt: -1 });
        } catch (error) {
            console.error(`Error finding tasks by projectId ${projectId}:`, error);
            return [];
        }
    }
}

module.exports = TaskRepository;