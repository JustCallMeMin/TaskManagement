const mongoose = require("mongoose");
const { TASK_PRIORITY, TASK_STATUS } = require("../utils/enums");
const { checkAssignedUser } = require("../middlewares/task.middleware");

const taskSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, minlength: 3, maxlength: 255 },
		description: { type: String, default: null },
		dueDate: {
			type: Date,
			default: null,
			validate: {
				validator: function (value) {
					if (value === null) return true;
					return value instanceof Date && !isNaN(value);
				},
				message: "Ngày hạn chót không hợp lệ",
			},
		},
		priority: {
			type: String,
			enum: Object.values(TASK_PRIORITY),
			required: true,
		},
		status: { type: String, enum: Object.values(TASK_STATUS), required: true },
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
			default: null,
		},
		assignedUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		isPersonal: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

// Middleware kiểm tra ngày hạn chót
taskSchema.pre("save", async function (next) {
	if (this.dueDate === null) {
		return next();
	}

	// Nếu là task cá nhân, không cần kiểm tra thêm
	if (this.isPersonal) {
		return next();
	}

	// Nếu là task của dự án, kiểm tra ngày sau ngày bắt đầu dự án
	if (this.projectId) {
		try {
			const Project = mongoose.model("Project");
			const project = await Project.findById(this.projectId);

			if (!project) {
				throw new Error("Không tìm thấy dự án");
			}

			if (this.dueDate < project.startDate) {
				throw new Error("Ngày hạn chót phải sau ngày bắt đầu dự án");
			}
		} catch (error) {
			return next(error);
		}
	}

	next();
});

// Gán middleware kiểm tra người được gán
taskSchema.pre("save", checkAssignedUser);

// Tăng hiệu suất truy vấn
taskSchema.index({ projectId: 1 });
taskSchema.index({ assignedUserId: 1 });
taskSchema.index({ isPersonal: 1 });

module.exports = mongoose.model("Task", taskSchema);
