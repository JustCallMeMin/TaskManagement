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
      const response = await api.get('/projects');
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
      // Use the correct API endpoint
      const response = await api.post('/projects/organization', projectData);
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
      const response = await api.put(`/projects/${projectId}`, projectData);
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
      // For deleting a single project
      if (projectIds.length === 1) {
        // Send project IDs as a query parameter instead of in body for DELETE requests
        const response = await api.delete(`/projects/${projectIds[0]}?ids=${projectIds[0]}`);
        return response.data;
      }
      
      // For batch delete - not currently supported by backend
      throw new Error('Batch delete not supported');
    } catch (error) {
      console.error('Error deleting projects:', error);
      throw error;
    }
  }

  /**
   * Send invitations to users to join a project
   * @param {string} projectId Project ID
   * @param {Array<string>} memberIds Array of user IDs to invite
   * @returns {Promise} Promise containing the invitation result
   */
  async addMembers(projectId, memberIds) {
    try {
      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        console.error('Invalid member IDs:', memberIds);
        throw new Error('Invalid member IDs');
      }
      
      const response = await api.post(`/projects/${projectId}/members`, { members: memberIds });
      return response.data;
    } catch (error) {
      console.error('Error inviting members:', error);
      throw error;
    }
  }

  /**
   * Get all pending project invitations for the current user
   * @returns {Promise} Promise containing the list of invitations
   */
  async getMyInvitations() {
    try {
      const response = await api.get('/projects/invitations/me');
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  }

  /**
   * Accept a project invitation
   * @param {string} invitationId Invitation ID
   * @returns {Promise} Promise containing the result
   */
  async acceptInvitation(invitationId) {
    try {
      // Accept the invitation
      const response = await api.post(`/projects/invitations/${invitationId}/accept`);
      
      // Force refresh the project list to ensure UI is updated
      try {
        // Intentionally not awaiting this to avoid blocking
        this.getAllProjects();
      } catch (refreshError) {
        console.warn('Project list refresh failed after accepting invitation:', refreshError);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  /**
   * Reject a project invitation
   * @param {string} invitationId Invitation ID
   * @returns {Promise} Promise containing the result
   */
  async rejectInvitation(invitationId) {
    try {
      const response = await api.post(`/projects/invitations/${invitationId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting invitation:', error);
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
      const response = await api.delete(`/projects/${projectId}/members`, { data: { userIds } });
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
      const response = await api.get(`/projects/${projectId}`);
      console.log('Project details response:', response);
      
      // The API returns { success: true, data: {...}, message: string }
      const projectData = response.data?.data || response.data;
      
      if (!projectData) {
        console.error('Invalid project data format:', response.data);
        throw new Error('Invalid project data received');
      }
      
      // Log raw project data to inspect structure
      console.log('Raw project data:', projectData);
      console.log('Project ID from URL:', projectId);
      
      // Normalize the project data to ensure consistent structure
      const normalizedProject = {
        _id: projectId, // Use the projectId from the URL parameter as primary source
        projectId: projectId, // Same here
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
      
      console.log('Normalized project data with fixed IDs:', normalizedProject);
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
      const response = await api.get(`/projects/${projectId}/members`);
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