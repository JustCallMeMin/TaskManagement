const mongoose = require("mongoose");
const { GROUP_ROLE } = require("../../utils/enums");

const groupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Tên nhóm là bắt buộc."],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		members: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				role: {
					type: String,
					enum: Object.values(GROUP_ROLE),
					default: GROUP_ROLE.MEMBER,
				},
				joinedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
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
groupSchema.index({ name: 1 });
groupSchema.index({ "members.userId": 1 });
groupSchema.index({ createdBy: 1 });

// Methods
groupSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.__v;
	return obj;
};

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
