const TASK_PRIORITY = Object.freeze({
	LOW: "LOW",
	MEDIUM: "MEDIUM",
	HIGH: "HIGH",
	URGENT: "URGENT",
});

const TASK_STATUS = Object.freeze({
	TODO: "TODO",
	IN_PROGRESS: "IN_PROGRESS",
	REVIEW: "REVIEW",
	DONE: "DONE",
});

const PROJECT_STATUS = Object.freeze({
	ACTIVE: "ACTIVE",
	ON_HOLD: "ON_HOLD",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
});

const PROJECT_ROLE = Object.freeze({
	OWNER: "OWNER",
	ADMIN: "ADMIN",
	MEMBER: "MEMBER",
	VIEWER: "VIEWER",
});

const NOTIFICATION_TYPE = Object.freeze({
	TASK_ASSIGNED: "TASK_ASSIGNED",
	TASK_UPDATED: "TASK_UPDATED",
	TASK_COMPLETED: "TASK_COMPLETED",
	PROJECT_INVITED: "PROJECT_INVITED",
	PROJECT_UPDATED: "PROJECT_UPDATED",
	COMMENT_ADDED: "COMMENT_ADDED",
	MENTIONED: "MENTIONED",
});

const ROLE = Object.freeze({
	ADMIN: "Admin",
	MANAGER: "Manager",
	USER: "User",
});

// 🔹 Vai trò trong nhóm
const GROUP_ROLE = Object.freeze({
	ADMIN: "ADMIN",
	MEMBER: "MEMBER",
});

module.exports = {
	TASK_PRIORITY,
	TASK_STATUS,
	PROJECT_STATUS,
	PROJECT_ROLE,
	NOTIFICATION_TYPE,
	ROLE,
	GROUP_ROLE,
};
