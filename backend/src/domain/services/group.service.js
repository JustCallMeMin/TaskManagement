const GroupRepository = require("../repositories/group.repository");
const UserRepository = require("../repositories/user.repository");
const { GROUP_ROLE } = require("../../utils/enums");

class GroupService {
	static async getGroups(userId) {
		return await GroupRepository.findByUserId(userId);
	}

	static async getGroupById(groupId) {
		return await GroupRepository.findById(groupId);
	}

	static async createGroup(groupData, userId) {
		// Kiểm tra xem người dùng có quyền tạo nhóm không
		const user = await UserRepository.findById(userId);
		if (!user) {
			throw new Error("Không tìm thấy người dùng.");
		}

		// Tạo nhóm mới với người tạo là admin
		const group = await GroupRepository.create({
			...groupData,
			members: [
				{
					userId,
					role: GROUP_ROLE.ADMIN,
				},
			],
		});

		return group;
	}

	static async updateGroup(groupId, updateData, userId) {
		// Kiểm tra quyền cập nhật
		const group = await GroupRepository.findById(groupId);
		if (!group) {
			throw new Error("Không tìm thấy nhóm.");
		}

		const member = group.members.find((m) => m.userId.toString() === userId);
		if (!member || member.role !== GROUP_ROLE.ADMIN) {
			throw new Error("Bạn không có quyền cập nhật nhóm này.");
		}

		return await GroupRepository.update(groupId, updateData);
	}

	static async deleteGroup(groupId, userId) {
		// Kiểm tra quyền xóa
		const group = await GroupRepository.findById(groupId);
		if (!group) {
			throw new Error("Không tìm thấy nhóm.");
		}

		const member = group.members.find((m) => m.userId.toString() === userId);
		if (!member || member.role !== GROUP_ROLE.ADMIN) {
			throw new Error("Bạn không có quyền xóa nhóm này.");
		}

		return await GroupRepository.delete(groupId);
	}

	static async addMembers(groupId, memberIds, userId) {
		// Kiểm tra quyền thêm thành viên
		const group = await GroupRepository.findById(groupId);
		if (!group) {
			throw new Error("Không tìm thấy nhóm.");
		}

		const member = group.members.find((m) => m.userId.toString() === userId);
		if (!member || member.role !== GROUP_ROLE.ADMIN) {
			throw new Error("Bạn không có quyền thêm thành viên vào nhóm này.");
		}

		// Kiểm tra xem các thành viên có tồn tại không
		const users = await UserRepository.findByIds(memberIds);
		if (users.length !== memberIds.length) {
			throw new Error("Một số thành viên không tồn tại.");
		}

		// Thêm thành viên mới vào nhóm
		const newMembers = memberIds.map((memberId) => ({
			userId: memberId,
			role: GROUP_ROLE.MEMBER,
		}));

		return await GroupRepository.addMembers(groupId, newMembers);
	}

	static async removeMembers(groupId, memberIds, userId) {
		// Kiểm tra quyền xóa thành viên
		const group = await GroupRepository.findById(groupId);
		if (!group) {
			throw new Error("Không tìm thấy nhóm.");
		}

		const member = group.members.find((m) => m.userId.toString() === userId);
		if (!member || member.role !== GROUP_ROLE.ADMIN) {
			throw new Error("Bạn không có quyền xóa thành viên khỏi nhóm này.");
		}

		// Không cho phép xóa admin
		const membersToRemove = group.members.filter(
			(m) =>
				memberIds.includes(m.userId.toString()) && m.role !== GROUP_ROLE.ADMIN
		);

		if (membersToRemove.length === 0) {
			throw new Error("Không thể xóa admin khỏi nhóm.");
		}

		return await GroupRepository.removeMembers(groupId, memberIds);
	}
}

module.exports = GroupService;
