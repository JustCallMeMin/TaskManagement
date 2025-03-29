const mongoose = require("mongoose");
const { ROLE } = require("../utils/enums");

const roleSchema = new mongoose.Schema(
	{
		roleName: {
			type: String,
			enum: Object.values(ROLE),
			required: true,
			unique: true,
		},
	},
	{ timestamps: true }
); // Bật timestamps để theo dõi createdAt và updatedAt

module.exports = mongoose.model("Role", roleSchema);
