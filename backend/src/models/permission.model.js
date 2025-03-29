const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
	{
		permissionName: { type: String, required: true },
		description: { type: String },
	},
	{ timestamps: true }
);

// Tạo index cho permissionName
permissionSchema.index({ permissionName: 1 }, { unique: true });

module.exports = mongoose.model("Permission", permissionSchema);
