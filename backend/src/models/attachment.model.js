const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
	{
		taskId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			required: true,
		},
		filePath: { type: String, required: true },
		fileType: { type: String, required: true },
		fileSize: { type: Number, required: true, min: 0 },
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

// Tăng hiệu suất truy vấn
attachmentSchema.index({ taskId: 1 });
attachmentSchema.index({ user: 1 });

module.exports = mongoose.model("Attachment", attachmentSchema);
