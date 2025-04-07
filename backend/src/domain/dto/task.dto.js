class TaskDTO {
    constructor(task) {
        this.id = task._id;
        this.title = task.title;
        this.description = task.description;
        this.dueDate = task.dueDate;
        this.priority = task.priority;
        this.status = task.status;
        this.projectId = task.projectId;
        this.assignedUserId = task.assignedUserId;
        this.isPersonal = task.isPersonal;
        this.createdBy = task.createdBy;
        this.createdAt = task.createdAt;
        this.updatedAt = task.updatedAt;
    }
}

module.exports = TaskDTO;