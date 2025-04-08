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
      const response = await api.get("/tasks");
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      // Return empty array if API call fails
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
      return response.data.data;
    } catch (error) {
      console.error('Error getting task details:', error);
      throw new Error(error.response?.data?.message || "Không thể lấy thông tin công việc");
    }
  }

  /**
   * Tạo công việc cá nhân mới
   * @param {Object} taskData Dữ liệu của task mới
   * @returns {Promise} Promise chứa thông tin của task đã tạo
   */
  async createPersonalTask(taskData) {
    try {
      const response = await api.post("/tasks/personal", taskData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating personal task:', error);
      throw new Error(error.response?.data?.message || "Không thể tạo công việc cá nhân");
    }
  }

  /**
   * Tạo công việc thuộc dự án
   * @param {Object} taskData Dữ liệu của task mới
   * @returns {Promise} Promise chứa thông tin của task đã tạo
   */
  async createProjectTask(taskData) {
    try {
      const response = await api.post("/tasks/project", taskData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating project task:', error);
      throw new Error(error.response?.data?.message || "Không thể tạo công việc cho dự án");
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
      return response.data.data;
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
      return response.data.data;
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
      return response.data.data;
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
      return response.data.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error(error.response?.data?.message || "Không thể xóa công việc");
    }
  }

  // Get tasks by project ID
  async getTasksByProject(projectId) {
    try {
      const response = await api.get(`/tasks?projectId=${projectId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting tasks by project:', error);
      return [];
    }
  }
}

const taskService = new TaskService();
export default taskService; 