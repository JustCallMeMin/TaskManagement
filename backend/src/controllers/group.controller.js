const GroupService = require("../domain/services/group.service");
const { successResponse, errorResponse } = require("../utils/response");

class GroupController {
	static async getGroups(req, res) {
		try {
			const groups = await GroupService.getGroups(req.user.id);
			return successResponse(res, groups, "Lấy danh sách nhóm thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async getGroupById(req, res) {
		try {
			const group = await GroupService.getGroupById(req.params.groupId);
			if (!group) {
				return errorResponse(res, "Không tìm thấy nhóm.", 404);
			}
			return successResponse(res, group, "Lấy thông tin nhóm thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async createGroup(req, res) {
		try {
			const group = await GroupService.createGroup(req.body, req.user.id);
			return successResponse(res, group, "Tạo nhóm thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async updateGroup(req, res) {
		try {
			const group = await GroupService.updateGroup(
				req.params.groupId,
				req.body,
				req.user.id
			);
			if (!group) {
				return errorResponse(res, "Không tìm thấy nhóm.", 404);
			}
			return successResponse(res, group, "Cập nhật nhóm thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async deleteGroup(req, res) {
		try {
			const result = await GroupService.deleteGroup(
				req.params.groupId,
				req.user.id
			);
			if (!result) {
				return errorResponse(res, "Không tìm thấy nhóm.", 404);
			}
			return successResponse(res, null, "Xóa nhóm thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async addMembers(req, res) {
		try {
			const group = await GroupService.addMembers(
				req.params.groupId,
				req.body.members,
				req.user.id
			);
			if (!group) {
				return errorResponse(res, "Không tìm thấy nhóm.", 404);
			}
			return successResponse(res, group, "Thêm thành viên thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}

	static async removeMembers(req, res) {
		try {
			const group = await GroupService.removeMembers(
				req.params.groupId,
				req.body.memberIds,
				req.user.id
			);
			if (!group) {
				return errorResponse(res, "Không tìm thấy nhóm.", 404);
			}
			return successResponse(res, group, "Xóa thành viên thành công.");
		} catch (error) {
			return errorResponse(res, error.message, 500);
		}
	}
}

// Export các phương thức static của GroupController
module.exports = {
	getGroups: GroupController.getGroups,
	getGroupById: GroupController.getGroupById,
	createGroup: GroupController.createGroup,
	updateGroup: GroupController.updateGroup,
	deleteGroup: GroupController.deleteGroup,
	addMembers: GroupController.addMembers,
	removeMembers: GroupController.removeMembers,
};
