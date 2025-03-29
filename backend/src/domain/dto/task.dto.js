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
    }
}

module.exports = TaskDTO;