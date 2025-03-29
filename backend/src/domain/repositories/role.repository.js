const Role = require("../../models/role.model");

class RoleRepository {
	static async findByName(roleName) {
		return await Role.findOne({ roleName });
	}

	static async findById(roleId) {
		return await Role.findOne({ _id: roleId });
	}

	static async create(roleData) {
		const role = new Role(roleData);
		return await role.save();
	}

	static async getAllRoles() {
		return await Role.find({});
	}
}

module.exports = RoleRepository;
