import api from "../../../services/api.service";
import { PROJECT_STATUS } from "../constants/project.constants";

/**
 * Service for handling project-related operations
 */
class ProjectService {
  // Mock data for development
  mockProjects = [
    {
      _id: 'p1',
      name: 'Dự án Marketing 2023',
      description: 'Chiến dịch marketing cho sản phẩm mới Q4/2023',
      startDate: new Date(2023, 9, 1).toISOString(),
      endDate: new Date(2023, 11, 31).toISOString(),
      status: PROJECT_STATUS.IN_PROGRESS,
      ownerId: 'u1',
      memberCount: 5,
      taskStats: {
        total: 12,
        completed: 5
      }
    },
    {
      _id: 'p2',
      name: 'Phát triển website',
      description: 'Phát triển website cho khách hàng ABC Corp',
      startDate: new Date(2023, 8, 15).toISOString(),
      endDate: new Date(2024, 1, 28).toISOString(),
      status: PROJECT_STATUS.IN_PROGRESS,
      ownerId: 'u1',
      memberCount: 3,
      taskStats: {
        total: 24,
        completed: 8
      }
    },
    {
      _id: 'p3',
      name: 'Tài liệu kỹ thuật',
      description: 'Viết tài liệu kỹ thuật và hướng dẫn sử dụng',
      startDate: new Date(2023, 10, 1).toISOString(),
      endDate: new Date(2023, 11, 15).toISOString(),
      status: PROJECT_STATUS.NOT_STARTED,
      ownerId: 'u1',
      memberCount: 2,
      taskStats: {
        total: 5,
        completed: 0
      }
    }
  ];

  // Mock users for project members
  mockUsers = [
    {
      _id: 'u1',
      email: 'admin@example.com',
      fullName: 'Admin User'
    },
    {
      _id: 'u2',
      email: 'user1@example.com',
      fullName: 'John Doe'
    },
    {
      _id: 'u3',
      email: 'user2@example.com',
      fullName: 'Jane Smith'
    },
    {
      _id: 'u4',
      email: 'user3@example.com',
      fullName: 'Bob Johnson'
    }
  ];

  /**
   * Get all projects for the current user
   * @returns {Promise} Promise containing the list of projects
   */
  async getAllProjects() {
    try {
      // Always try the real API call first
      const response = await api.get('/projects');
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting projects:', error);
      // Return empty array if API call fails
      return [];
    }
  }

  /**
   * Get details of a specific project
   * @param {string} projectId Project ID
   * @returns {Promise} Promise containing project details
   */
  async getProjectById(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting project details:', error);
      throw error;
    }
  }

  /**
   * Create a new organization project
   * @param {Object} projectData Project data
   * @returns {Promise} Promise containing the created project
   */
  async createProject(projectData) {
    try {
      const response = await api.post('/projects/organization', projectData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   * @param {string} projectId Project ID
   * @param {Object} projectData Updated project data
   * @returns {Promise} Promise containing the updated project
   */
  async updateProject(projectId, projectData) {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete one or more projects
   * @param {Array} projectIds Array of project IDs to delete
   * @returns {Promise} Promise containing the result of the deletion
   */
  async deleteProjects(projectIds) {
    try {
      const response = await api.delete(`/projects/${projectIds[0]}`, {
        data: { projectIds }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error deleting projects:', error);
      throw error;
    }
  }

  /**
   * Get members of a specific project
   * @param {string} projectId Project ID
   * @returns {Promise} Promise containing the list of project members
   */
  async getProjectMembers(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting project members:', error);
      return [];
    }
  }

  /**
   * Add members to a project
   * @param {string} projectId Project ID
   * @param {Array} members Array of user IDs to add to the project
   * @returns {Promise} Promise containing the result of the operation
   */
  async addMembers(projectId, members) {
    try {
      const response = await api.post(`/projects/${projectId}/members`, { members });
      return response.data.data;
    } catch (error) {
      console.error('Error adding project members:', error);
      throw error;
    }
  }

  /**
   * Remove members from a project
   * @param {string} projectId Project ID
   * @param {Array} userIds Array of user IDs to remove from the project
   * @returns {Promise} Promise containing the result of the operation
   */
  async removeMembers(projectId, userIds) {
    try {
      const response = await api.delete(`/projects/${projectId}/members`, {
        data: { userIds }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error removing project members:', error);
      throw error;
    }
  }
}

export default new ProjectService(); 