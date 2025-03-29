import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { TASK_STATUS, TASK_PRIORITY } from '../constants';

const TaskItem = ({ task, onDelete, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.TODO:
        return '#ff9800';
      case TASK_STATUS.IN_PROGRESS:
        return '#2196f3';
      case TASK_STATUS.DONE:
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case TASK_PRIORITY.HIGH:
        return '#f44336';
      case TASK_PRIORITY.MEDIUM:
        return '#ff9800';
      case TASK_PRIORITY.LOW:
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  return (
    <Box className="task-item">
      <Box className="task-content">
        <Typography variant="subtitle1" className="task-title">
          {task.title}
        </Typography>
        {task.description && (
          <Typography variant="body2" color="text.secondary" className="task-description">
            {task.description}
          </Typography>
        )}
        <Box className="task-meta">
          <Chip
            label={task.status || TASK_STATUS.TODO}
            size="small"
            sx={{
              backgroundColor: getStatusColor(task.status),
              color: 'white'
            }}
          />
          <Chip
            label={task.priority || TASK_PRIORITY.MEDIUM}
            size="small"
            sx={{
              backgroundColor: getPriorityColor(task.priority),
              color: 'white'
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </Typography>
        </Box>
      </Box>
      <Box className="task-actions">
        <IconButton onClick={() => onEdit(task.id)} size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(task.id)} size="small">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TaskItem; 