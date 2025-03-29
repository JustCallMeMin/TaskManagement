const UserRole = require("../../models/user_role.model");

class UserRoleRepository {
	static async create(data) {
		return UserRole.create(data);
	}

	static async findByUserId(userId) {
		return UserRole.find({ userId }).populate("roleId");
	}

	static async deleteByUserId(userId) {
		return UserRole.deleteMany({ userId });
	}

	static async findByUserIdAndRoleId(userId, roleId) {
		return UserRole.findOne({ userId, roleId });
	}

	static async deleteByUserIdAndRoleId(userId, roleId) {
		return UserRole.deleteOne({ userId, roleId });
	}
}

module.exports = UserRoleRepository;
