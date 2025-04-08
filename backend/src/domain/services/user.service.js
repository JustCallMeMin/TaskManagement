const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const UserRole = require("../../models/user_role.model");
const UserDTO = require("../dto/user.dto");

class UserService {
  /**
   * Get all users in the system
   * @returns {Promise<Array>} Array of user objects
   */
  static async getAllUsers() {
    try {
      console.log("Getting all users");
      const users = await User.find({}).populate('roles');
      console.log(`Found ${users.length} users`);
      
      // Map to DTOs to ensure consistent formatting and hide sensitive data
      return users.map(user => {
        return {
          _id: user._id,
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isVerified: user.isVerified,
          isBlocked: user.isBlocked,
          roles: user.roles.map(role => role.roleName)
        };
      });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw new Error("Failed to get users");
    }
  }

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching user objects
   */
  static async searchUsers(query) {
    try {
      console.log(`Searching users with query: ${query}`);
      
      // Tìm kiếm người dùng theo tên hoặc email
      const users = await User.find({
        $or: [
          { fullName: { $regex: query, $options: 'i' } }, // Case insensitive
          { email: { $regex: query, $options: 'i' } }
        ],
        isBlocked: false // Chỉ trả về người dùng không bị khóa
      }).populate('roles');
      
      console.log(`Found ${users.length} users matching query "${query}"`);
      
      // Map to DTOs to ensure consistent formatting and hide sensitive data
      return users.map(user => {
        return {
          _id: user._id,
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isVerified: user.isVerified,
          roles: user.roles.map(role => role.roleName)
        };
      });
    } catch (error) {
      console.error("Error in searchUsers:", error);
      throw new Error("Failed to search users");
    }
  }

  /**
   * Assign a role to a user
   * @param {string} userId - The user's ID
   * @param {string|null} roleName - The role name to assign, or null to remove all roles
   * @returns {Promise<Object>} Result object
   */
  static async assignRole(userId, roleName) {
    try {
      console.log(`Handling role assignment for user ${userId}: ${roleName || 'NONE'}`);
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Remove any existing roles
      await UserRole.deleteMany({ userId });
      
      // If roleName is null or empty, just remove roles without assigning a new one
      if (!roleName) {
        console.log(`Removed all roles from user ${userId}`);
        return { success: true, message: `All roles removed from user` };
      }
      
      // Check if role exists
      const role = await Role.findOne({ roleName });
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }
      
      // Assign the new role
      await UserRole.create({
        userId,
        roleId: role._id
      });
      
      console.log(`Successfully assigned role ${roleName} to user ${userId}`);
      return { success: true, message: `Role ${roleName} assigned to user` };
    } catch (error) {
      console.error("Error in assignRole:", error);
      throw new Error(error.message || "Failed to assign role");
    }
  }

  /**
   * Create a new user from OAuth data
   * @param {Object} userData - User data from OAuth
   * @returns {Promise<Object>} Created user
   */
  static async createUser(userData) {
    try {
      console.log("Creating new user from OAuth:", userData.email);
      
      // Nếu đã có tài khoản với email này, trả về lỗi
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return existingUser;
      }
      
      // Tạo user mới
      const user = new User({
        fullName: userData.name,
        email: userData.email,
        username: userData.username,
        password: userData.password, // Đã mã hóa từ bên ngoài
        isVerified: userData.emailVerified || true, // Thường OAuth đã xác thực email
        oauthProvider: userData.oauthProvider,
        oauthId: userData.oauthId
      });
      
      // Lưu user
      await user.save();
      
      // Gán vai trò User cho người dùng mới
      const userRole = await Role.findOne({ roleName: 'User' });
      if (userRole) {
        await UserRole.create({
          userId: user._id,
          roleId: userRole._id
        });
        
        // Cập nhật thông tin vai trò trong user
        user.roles = [userRole._id];
        await user.save();
      }
      
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw new Error("Failed to create user: " + error.message);
    }
  }
}

module.exports = UserService;
