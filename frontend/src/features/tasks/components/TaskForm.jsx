import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { TASK_STATUS, TASK_PRIORITY } from '../constants';
import { useTaskService } from '../hooks/useTaskService';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, createTask, updateTask, loading, error } = useTaskService();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: ''
  });

  useEffect(() => {
    const fetchTask = async () => {
      if (isEditMode) {
        try {
          const taskData = await getTask(id);
          setFormData({
            ...taskData,
            dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : ''
          });
        } catch (err) {
          console.error('Error fetching task:', err);
        }
      }
    };
    fetchTask();
  }, [id, getTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateTask(id, formData);
      } else {
        await createTask(formData);
      }
      navigate('/tasks');
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            fullWidth
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {Object.entries(TASK_STATUS).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mb: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            fullWidth
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            {Object.entries(TASK_PRIORITY).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <TextField
          fullWidth
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            type="button"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TaskForm; 