import api from "../../../services/api.service";
import { PROJECT_STATUS } from "../constants/project.constants";

/**
 * Service for handling project-related operations
 */
class ProjectService {
  /**
   * Get all projects for the current user
   * @returns {Promise} Promise containing the list of projects
   */
  async getAllProjects() {
    try {
      // Always try the real API call first
      const response = await api.get('/api/projects');
      console.log('Complete API response:', {
        status: response.status,
        data: response.data
      });
      
      // Handle the API response format: { success: true, data: [], message: "" }
      const responseData = response.data;
      let projects = [];
      
      if (responseData && responseData.data) {
        // New API format
        projects = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Direct array format (fallback)
        projects = responseData;
      }
      
      console.log('Projects extracted from response:', projects);
      
      if (projects.length === 0) {
        console.log('No projects found in response');
        return [];
      }

      // Map the projects to match frontend format
      const mappedProjects = projects.map(project => {
        console.log('Processing project:', project);
        return {
          _id: project.projectId || project._id,
          name: project.name || 'Untitled Project',
          description: project.description || '',
          status: project.status || PROJECT_STATUS.IN_PROGRESS,
          isPersonal: Boolean(project.isPersonal),
          owner: project.owner || null,
          members: project.members || [],
          taskStats: project.taskStats || { total: 0, completed: 0 }
        };
      });

      console.log('Final mapped projects:', mappedProjects);
      return mappedProjects;
    } catch (error) {
      console.error('Error getting projects:', error.response || error);
      // Return empty array if API call fails
      return [];
    }
  }

  /**
   * Create a new project
   * @param {Object} projectData Project data to create
   * @returns {Promise} Promise containing the created project
   */
  async createProject(projectData) {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   * @param {string} projectId Project ID to update
   * @param {Object} projectData Updated project data
   * @returns {Promise} Promise containing the updated project
   */
  async updateProject(projectId, projectData) {
    try {
      const response = await api.put(`/api/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete multiple projects
   * @param {Array<string>} projectIds Array of project IDs to delete
   * @returns {Promise} Promise containing the deletion result
   */
  async deleteProjects(projectIds) {
    try {
      const response = await api.delete('/api/projects', { data: { projectIds } });
      return response.data;
    } catch (error) {
      console.error('Error deleting projects:', error);
      throw error;
    }
  }

  /**
   * Add members to a project
   * @param {string} projectId Project ID
   * @param {Array<string>} memberIds Array of user IDs to add
   * @returns {Promise} Promise containing the updated project
   */
  async addMembers(projectId, memberIds) {
    try {
      const response = await api.post(`/api/projects/${projectId}/members`, { members: memberIds });
      return response.data;
    } catch (error) {
      console.error('Error adding members:', error);
      throw error;
    }
  }

  /**
   * Remove members from a project
   * @param {string} projectId Project ID
   * @param {Array<string>} userIds Array of user IDs to remove
   * @returns {Promise} Promise containing the updated project
   */
  async removeMembers(projectId, userIds) {
    try {
      const response = await api.delete(`/api/projects/${projectId}/members`, { data: { userIds } });
      return response.data;
    } catch (error) {
      console.error('Error removing members:', error);
      throw error;
    }
  }

  /**
   * Get details of a specific project
   * @param {string} projectId Project ID
   * @returns {Promise} Promise containing project details
   */
  async getProjectById(projectId) {
    try {
      console.log(`Fetching project details for ID: ${projectId}`);
      const response = await api.get(`/api/projects/${projectId}`);
      console.log('Project details response:', response);
      
      // The API returns { success: true, data: {...}, message: string }
      const projectData = response.data?.data || response.data;
      
      if (!projectData) {
        console.error('Invalid project data format:', response.data);
        throw new Error('Invalid project data received');
      }
      
      // Normalize the project data to ensure consistent structure
      const normalizedProject = {
        _id: projectData.projectId || projectData._id,
        projectId: projectData.projectId || projectData._id,
        name: projectData.name || 'Untitled Project',
        description: projectData.description || '',
        status: projectData.status || 'ACTIVE',
        isPersonal: Boolean(projectData.isPersonal),
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        owner: projectData.owner || null,
        members: projectData.members || [],
        taskStats: projectData.taskStats || { total: 0, completed: 0 }
      };
      
      console.log('Normalized project data:', normalizedProject);
      return normalizedProject;
    } catch (error) {
      console.error('Error getting project details:', error);
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
      console.log(`Fetching members for project ID: ${projectId}`);
      const response = await api.get(`/api/projects/${projectId}/members`);
      console.log('Project members response:', response);
      
      // The API returns { success: true, data: [...], message: string }
      const membersData = response.data?.data || response.data || [];
      
      // Normalize the members data
      const normalizedMembers = Array.isArray(membersData) 
        ? membersData.map(member => ({
            userId: member.userId,
            fullName: member.fullName || 'Unknown User',
            email: member.email || '',
            role: member.role || 'MEMBER'
          }))
        : [];
      
      console.log('Normalized members data:', normalizedMembers);
      return normalizedMembers;
    } catch (error) {
      console.error('Error getting project members:', error);
      // Return empty array if API call fails
      return [];
    }
  }
}

export default new ProjectService();