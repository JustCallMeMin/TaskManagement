class TaskDTO {
    constructor(task) {
        this.id = task._id.toString();
        this.title = task.title;
        this.description = task.description;
        this.dueDate = task.dueDate;
        this.priority = task.priority;
        this.status = task.status;
        this.projectId = task.projectId ? task.projectId.toString() : null;
        this.assignedUserId = task.assignedUserId ? task.assignedUserId.toString() : null;
        this.isPersonal = task.isPersonal;
        this.createdBy = task.createdBy ? task.createdBy.toString() : null;
        this.createdAt = task.createdAt;
        this.updatedAt = task.updatedAt;
    }
}

module.exports = TaskDTO;