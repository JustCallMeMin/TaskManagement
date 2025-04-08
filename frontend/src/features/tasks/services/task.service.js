import api from "../../../services/api.service";
import { TASK_STATUS, TASK_PRIORITY } from "../constants/task.constants";

/**
 * Service xử lý các tác vụ liên quan đến Task
 */
class TaskService {
  /**
   * Lấy tất cả các task của người dùng
   * @returns {Promise} Promise chứa danh sách các task
   */
  async getAllTasks() {
    try {
      console.log('Fetching all tasks...');
      const response = await api.get("/tasks");
      console.log('Task API response received:', response.status);
      
      // Check if the response has a data property (new format) or is an array (old format)
      let tasks = [];
      
      if (response.data && response.data.data) {
        // New format: { success, data, message }
        tasks = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Old format: direct array
        tasks = response.data;
      }
      
      console.log(`Received ${tasks.length} tasks from API`);
      return tasks;
    } catch (error) {
      // Log the error but don't propagate it - return empty array instead
      console.error('Error getting tasks:', error);
      console.log('Returning empty task list due to error');
      return [];
    }
  }

  /**
   * Lấy chi tiết một task theo ID
   * @param {string} taskId ID của task
   * @returns {Promise} Promise chứa thông tin chi tiết của task
   */
  async getTaskById(taskId) {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      // Handle both the new format (with data property) and the old format
      const task = response.data && response.data.data 
        ? response.data.data  // New format: { success, data, message }
        : response.data;      // Old format: direct object
        
      console.log('Task details received from API:', task);
      return task;
    } catch (error) {
      console.error('Error getting task details:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Không thể lấy thông tin công việc");
    }
  }

  /**
   * Tạo task mới (cá nhân hoặc dự án)
   * @param {Object} taskData Dữ liệu của task mới
   * @returns {Promise} Promise chứa thông tin của task đã tạo
   */
  async createTask(taskData) {
    try {
      // Determine if this is a personal task or project task
      const isPersonal = !taskData.projectId;
      
      // Use the correct endpoint based on task type
      const endpoint = isPersonal ? "/tasks/personal" : "/tasks/project";
      
      // Ensure required fields are set
      const data = {
        ...taskData,
        isPersonal,
        priority: taskData.priority || TASK_PRIORITY.MEDIUM,
        status: taskData.status || TASK_STATUS.TODO
      };
      
      // Format the date properly if it exists
      if (data.dueDate) {
        // Ensure dueDate is a valid ISO date string
        const dueDate = new Date(data.dueDate);
        if (!isNaN(dueDate.getTime())) {
          data.dueDate = dueDate.toISOString();
        }
      }
      
      console.log("Creating task with data:", data);
      
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Không thể tạo công việc");
    }
  }

  /**
   * Cập nhật thông tin task
   * @param {string} taskId ID của task
   * @param {Object} taskData Dữ liệu cập nhật
   * @returns {Promise} Promise chứa thông tin của task đã cập nhật
   */
  async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error(error.response?.data?.message || "Không thể cập nhật công việc");
    }
  }

  /**
   * Cập nhật trạng thái của task
   * @param {string} taskId ID của task
   * @param {string} status Trạng thái mới
   * @returns {Promise} Promise chứa thông tin của task đã cập nhật
   */
  async updateTaskStatus(taskId, status) {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error(error.response?.data?.message || "Không thể cập nhật trạng thái công việc");
    }
  }

  /**
   * Gán task cho người dùng
   * @param {string} taskId ID của task
   * @param {string} userId ID của người dùng được gán
   * @returns {Promise} Promise chứa thông tin của task đã cập nhật
   */
  async assignTask(taskId, userId) {
    try {
      const response = await api.patch(`/tasks/${taskId}/assign`, { assignedUserId: userId });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Không thể gán công việc cho người dùng");
    }
  }

  /**
   * Xóa task
   * @param {string} taskId ID của task
   * @returns {Promise} Promise chứa kết quả xóa
   */
  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error(error.response?.data?.message || "Không thể xóa công việc");
    }
  }

  // Get tasks by project ID
  async getTasksByProject(projectId) {
    try {
      const response = await api.get(`/tasks?projectId=${projectId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting tasks by project:', error);
      return [];
    }
  }
}

const taskService = new TaskService();
export default taskService; 