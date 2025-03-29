import api from "../../../services/api";
import { TASK_STATUS, TASK_PRIORITY } from "../constants/task.constants";

/**
 * Service xử lý các tác vụ liên quan đến Task
 */
class TaskService {
  // Mock data for testing
  mockTasks = [
    {
      _id: '1',
      title: 'Hoàn thành báo cáo dự án',
      description: 'Tổng hợp dữ liệu và viết báo cáo tổng kết quý I/2023',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      isPersonal: false,
      projectId: 'project-1',
      assignedUserId: 'user-1'
    },
    {
      _id: '2',
      title: 'Mua quà sinh nhật',
      description: 'Mua quà sinh nhật cho đồng nghiệp',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      isPersonal: true,
      projectId: null,
      assignedUserId: 'user-1'
    },
    {
      _id: '3',
      title: 'Lên ý tưởng marketing',
      description: 'Brainstorm ý tưởng marketing cho sản phẩm mới',
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago (overdue)
      priority: TASK_PRIORITY.URGENT,
      status: TASK_STATUS.TODO,
      isPersonal: false,
      projectId: 'project-2',
      assignedUserId: 'user-1'
    },
    {
      _id: '4',
      title: 'Đọc sách',
      description: 'Đọc 30 trang sách "Atomic Habits"',
      dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
      priority: TASK_PRIORITY.LOW,
      status: TASK_STATUS.DONE,
      isPersonal: true,
      projectId: null,
      assignedUserId: 'user-1'
    }
  ];

  /**
   * Lấy tất cả các task của người dùng
   * @returns {Promise} Promise chứa danh sách các task
   */
  async getAllTasks() {
    try {
      console.log('Getting all tasks (mock)');
      // Trả về mock data thay vì gọi API thật
      return new Promise((resolve) => {
        // Giả lập độ trễ mạng
        setTimeout(() => {
          resolve(this.mockTasks);
        }, 800);
      });
      
      // Code gọi API thật (tạm thời comment)
      // const response = await api.get("/tasks");
      // return response.data.data;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw new Error(error.response?.data?.message || "Không thể lấy danh sách công việc");
    }
  }

  /**
   * Lấy chi tiết một task theo ID
   * @param {string} taskId ID của task
   * @returns {Promise} Promise chứa thông tin chi tiết của task
   */
  async getTaskById(taskId) {
    try {
      console.log('Getting task details (mock):', taskId);
      // Trả về mock data thay vì gọi API thật
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const task = this.mockTasks.find(t => t._id === taskId);
          if (task) {
            resolve(task);
          } else {
            reject(new Error("Không tìm thấy công việc"));
          }
        }, 500);
      });
      
      // Code gọi API thật (tạm thời comment)
      // const response = await api.get(`/tasks/${taskId}`);
      // return response.data.data;
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
      console.log('Creating personal task (mock):', taskData);
      return new Promise((resolve) => {
        setTimeout(() => {
          const newTask = {
            _id: 'new-' + Date.now(),
            ...taskData,
            isPersonal: true,
            assignedUserId: 'user-1'
          };
          this.mockTasks.push(newTask);
          resolve(newTask);
        }, 800);
      });
      
      // Code gọi API thật (tạm thời comment)
      // const response = await api.post("/tasks/personal", taskData);
      // return response.data.data;
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
      console.log('Creating project task (mock):', taskData);
      return new Promise((resolve) => {
        setTimeout(() => {
          const newTask = {
            _id: 'new-' + Date.now(),
            ...taskData,
            isPersonal: false,
            assignedUserId: 'user-1',
            projectId: taskData.projectId || 'project-default'
          };
          this.mockTasks.push(newTask);
          resolve(newTask);
        }, 800);
      });
      
      // Code gọi API thật (tạm thời comment)
      // const response = await api.post("/tasks/project", taskData);
      // return response.data.data;
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
      console.log('Updating task (mock):', taskId, taskData);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = this.mockTasks.findIndex(t => t._id === taskId);
          if (index !== -1) {
            const updatedTask = {
              ...this.mockTasks[index],
              ...taskData
            };
            this.mockTasks[index] = updatedTask;
            resolve(updatedTask);
          } else {
            reject(new Error("Không tìm thấy công việc cần cập nhật"));
          }
        }, 800);
      });
      
      // Code gọi API thật (tạm thời comment)
      // const response = await api.put(`/tasks/${taskId}`, taskData);
      // return response.data.data;
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
      console.log('Updating task status (mock):', taskId, status);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = this.mockTasks.findIndex(t => t._id === taskId);
          if (index !== -1) {
            this.mockTasks[index].status = status;
            resolve(this.mockTasks[index]);
          } else {
            reject(new Error("Không tìm thấy công việc cần cập nhật"));
          }
        }, 500);
      });
      
      // Code gọi API thật (tạm thời comment)
      // const response = await api.patch(`/tasks/${taskId}/status`, { status });
      // return response.data.data;
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
      console.log('Deleting task (mock):', taskId);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = this.mockTasks.findIndex(t => t._id === taskId);
          if (index !== -1) {
            this.mockTasks.splice(index, 1);
            resolve({ success: true, message: "Đã xóa công việc" });
          } else {
            reject(new Error("Không tìm thấy công việc cần xóa"));
          }
        }, 800);
      });
      
      // Code gọi API thật (tạm thời comment)
      // const response = await api.delete(`/tasks/${taskId}`);
      // return response.data.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error(error.response?.data?.message || "Không thể xóa công việc");
    }
  }
}

const taskService = new TaskService();
export default taskService; 