const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
	{
		taskId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: { type: String, required: true, minlength: 1, maxlength: 1000 },
		assignedUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
	},
	{ timestamps: true }
);

// Tăng hiệu suất truy vấn
commentSchema.index({ taskId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ assignedUserId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
