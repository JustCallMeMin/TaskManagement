const mongoose = require("mongoose");
const { PROJECT_STATUS } = require("../utils/enums");

const projectSchema = new mongoose.Schema(
	{
		ownerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: { type: String, required: true, minlength: 3, maxlength: 255 },
		description: { type: String, default: null },
		startDate: { type: Date, default: null },
		endDate: {
			type: Date,
			default: null,
			validate: {
				validator: function (value) {
					return !this.startDate || value >= this.startDate;
				},
				message: "Ngày kết thúc phải sau ngày bắt đầu",
			},
		},
		status: {
			type: String,
			enum: Object.values(PROJECT_STATUS),
			required: true,
		},
		isPersonal: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

// Tăng hiệu suất truy vấn
projectSchema.index({ ownerId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Project", projectSchema);
