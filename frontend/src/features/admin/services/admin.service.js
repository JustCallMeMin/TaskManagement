import api from "../../../services/api.service";

/**
 * Service for admin operations
 */
class AdminService {
  /**
   * Get all users in the system
   * @returns {Promise<Array>} Promise with array of users
   */
  async getAllUsers() {
    try {
      const response = await api.get("/users");
      
      // Handle different response formats
      if (response && response.data) {
        return Array.isArray(response.data) ? response.data : response.data.data || [];
      }
      return response || [];
      
    } catch (error) {
      // Handle permission error gracefully
      if (error.response && error.response.status === 403) {
        console.warn("Permission denied: User does not have access to admin features");
        return []; // Return empty array silently
      }
      
      console.error("Error fetching users:", error);
      return []; // For UI friendliness, return empty array
    }
  }

  /**
   * Assign a role to a user
   * @param {string} userId The user's ID
   * @param {string} roleName The role to assign
   * @returns {Promise<Object>} Promise with the result
   */
  async assignRole(userId, roleName) {
    try {
      const response = await api.post("/users/assign-role", {
        userId,
        roleName
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  }
}

export default new AdminService(); 