const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		deviceInfo: {
			type: String,
			required: true,
		},
		ipAddress: {
			type: String,
			required: true,
		},
		lastActivity: {
			type: Date,
			default: Date.now,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ isActive: 1 });

module.exports = mongoose.model("Session", sessionSchema);
