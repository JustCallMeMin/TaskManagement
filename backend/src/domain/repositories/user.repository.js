const User = require("../../models/user.model");

class UserRepository {
	static async findByEmail(email) {
		console.log("Finding user by email:", email);
		const user = await User.findOne({ email });
		console.log("Found user:", user);
		return user;
	}

	static async findById(userId) {
		console.log("Finding user by ID:", userId);
		const user = await User.findById(userId).populate("roles");
		console.log("Found user by ID:", user);
		return user;
	}

	static async create(userData) {
		console.log("Creating new user with data:", {
			...userData,
			password: userData.password ? "[HASHED]" : undefined,
		});
		const user = new User(userData);
		const savedUser = await user.save();
		console.log("Created user:", {
			...savedUser.toObject(),
			password: "[HASHED]",
		});
		return savedUser;
	}

	static async update(userId, updateData) {
		console.log("Updating user:", userId, "with data:", {
			...updateData,
			password: updateData.password ? "[HASHED]" : undefined,
		});
		const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
		});
		console.log("Updated user:", {
			...updatedUser.toObject(),
			password: "[HASHED]",
		});
		return updatedUser;
	}

	static async findByResetToken(resetToken) {
		return User.findOne({ resetToken, resetTokenExpiry: { $gt: new Date() } });
	}

	static async delete(userId) {
		console.log("Deleting user:", userId);
		const user = await User.findById(userId);
		if (!user) return null;
		const result = await user.remove();
		console.log("Delete result:", result);
		return result;
	}
}

module.exports = UserRepository;
