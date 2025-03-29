const RolePermission = require("../../models/role_permission.model");

class RolePermissionRepository {
	static async findByRoleIds(roleIds) {
		return await RolePermission.find({ roleId: { $in: roleIds } }).populate(
			"permissionId",
			"permissionName"
		);
	}

	static async create(rolePermissionData) {
		const rolePermission = new RolePermission(rolePermissionData);
		return await rolePermission.save();
	}

	static async deleteByRoleId(roleId) {
		return await RolePermission.deleteMany({ roleId });
	}
}

module.exports = RolePermissionRepository;
