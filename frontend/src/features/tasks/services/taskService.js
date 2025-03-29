import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const taskService = {
  getAllTasks: async () => {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  },

  getTaskById: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    await axios.delete(`${API_URL}/tasks/${taskId}`);
  },

  updateTaskStatus: async (taskId, status) => {
    const response = await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status });
    return response.data;
  },

  assignTask: async (taskId, userId) => {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  getTaskComments: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/comments`);
    return response.data;
  },

  addTaskComment: async (taskId, comment) => {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/comments`, { comment });
    return response.data;
  }
}; 