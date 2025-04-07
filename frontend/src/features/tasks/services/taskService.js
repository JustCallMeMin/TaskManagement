import api from '../../../services/api.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const taskService = {
  getAllTasks: async () => {
    try {
      const response = await api.get(`/tasks`);
      return response || [];
    } catch (error) {
      // Let the error propagate to be handled by the hook
      throw error;
    }
  },

  getTaskById: async (taskId) => {
    return await api.get(`/tasks/${taskId}`);
  },

  createTask: async (taskData) => {
    // Determine if this is a personal task or project task
    const isPersonal = !taskData.projectId;
    
    // Use the correct endpoint based on task type
    const endpoint = isPersonal 
      ? `/tasks/personal` 
      : `/tasks/project`;
    
    // For personal tasks, ensure projectId is null and isPersonal is true
    const data = isPersonal
      ? { ...taskData, projectId: null, isPersonal: true }
      : { ...taskData, isPersonal: false };
    
    return await api.post(endpoint, data);
  },

  updateTask: async (taskId, taskData) => {
    return await api.put(`/tasks/${taskId}`, taskData);
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
  },

  updateTaskStatus: async (taskId, status) => {
    return await api.patch(`/tasks/${taskId}/status`, { status });
  },

  assignTask: async (taskId, assignedUserId) => {
    return await api.patch(`/tasks/${taskId}/assign`, { assignedUserId });
  },

  getTaskComments: async (taskId) => {
    return await api.get(`/tasks/${taskId}/comments`);
  },

  addTaskComment: async (taskId, comment) => {
    return await api.post(`/tasks/${taskId}/comments`, { comment });
  }
};

export default taskService; 