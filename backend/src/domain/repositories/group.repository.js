const Group = require("../models/group.model");

class GroupRepository {
	static async create(groupData) {
		const group = new Group(groupData);
		return await group.save();
	}

	static async findById(groupId) {
		return await Group.findById(groupId)
			.populate("members.userId", "fullName email avatar")
			.exec();
	}

	static async findByUserId(userId) {
		return await Group.find({
			"members.userId": userId,
		})
			.populate("members.userId", "fullName email avatar")
			.exec();
	}

	static async update(groupId, updateData) {
		return await Group.findByIdAndUpdate(
			groupId,
			{ $set: updateData },
			{ new: true }
		)
			.populate("members.userId", "fullName email avatar")
			.exec();
	}

	static async delete(groupId) {
		return await Group.findByIdAndDelete(groupId);
	}

	static async addMembers(groupId, newMembers) {
		return await Group.findByIdAndUpdate(
			groupId,
			{ $push: { members: { $each: newMembers } } },
			{ new: true }
		)
			.populate("members.userId", "fullName email avatar")
			.exec();
	}

	static async removeMembers(groupId, memberIds) {
		return await Group.findByIdAndUpdate(
			groupId,
			{ $pull: { members: { userId: { $in: memberIds } } } },
			{ new: true }
		)
			.populate("members.userId", "fullName email avatar")
			.exec();
	}
}

module.exports = GroupRepository;
