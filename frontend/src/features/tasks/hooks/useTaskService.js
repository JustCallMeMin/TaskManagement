import { useState, useCallback } from 'react';
import taskService from '../services/taskService';
import { toast } from 'react-toastify';

export const useTaskService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getAllTasks();
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        setError(null);
        return [];
      }
      
      const errorMsg = err.response?.data?.error || 'Failed to fetch tasks';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTaskById(id);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch task';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData) => {
    try {
      setLoading(true);
      
      if (taskData.projectId) {
        // Create project task
        const newTask = await taskService.createProjectTask(taskData);
        return newTask;
      } else {
        // Create personal task
        const newTask = await taskService.createPersonalTask(taskData);
        return newTask;
      }
    } catch (error) {
      setError(error.message);
      console.error("Error creating task:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = useCallback(async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.updateTask(id, taskData);
      toast.success('Task updated successfully');
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update task';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete task';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.updateTaskStatus(id, status);
      toast.success('Task status updated successfully');
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update task status';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignTask = useCallback(async (id, assignedUserId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.assignTask(id, assignedUserId);
      toast.success('Task assigned successfully');
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to assign task';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasksByProject = async (projectId) => {
    try {
      setLoading(true);
      const tasks = await taskService.getTasksByProject(projectId);
      return tasks;
    } catch (error) {
      setError(error.message);
      console.error("Error fetching tasks by project:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    getTasksByProject
  };
};

export default useTaskService; 