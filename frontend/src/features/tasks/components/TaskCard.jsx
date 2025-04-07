import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TASK_PRIORITY, TASK_STATUS } from '../constants';

const TaskCard = ({ task, onDelete }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/tasks/${task._id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/tasks/${task._id}/edit`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task._id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case TASK_PRIORITY.LOW:
        return 'success';
      case TASK_PRIORITY.MEDIUM:
        return 'info';
      case TASK_PRIORITY.HIGH:
        return 'warning';
      case TASK_PRIORITY.URGENT:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.TODO:
        return 'default';
      case TASK_STATUS.IN_PROGRESS:
        return 'info';
      case TASK_STATUS.REVIEW:
        return 'warning';
      case TASK_STATUS.DONE:
        return 'success';
      default:
        return 'default';
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== TASK_STATUS.DONE;
  };

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        cursor: 'pointer', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        },
        borderLeft: `4px solid ${getPriorityColor(task.priority) === 'default' ? '#757575' : `${getPriorityColor(task.priority)}.main`}`,
        backgroundColor: isOverdue() ? '#fff8f8' : 'background.paper'
      }}
      onClick={handleView}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Chip 
            label={task.status} 
            size="small" 
            color={getStatusColor(task.status)}
            sx={{ fontWeight: 500, mb: 1 }}
          />
        </Box>

        <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 500 }}>
          {task.title}
        </Typography>

        {task.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <FlagIcon fontSize="small" sx={{ mr: 0.5, color: `${getPriorityColor(task.priority)}.main` }} />
            <Typography variant="caption">{task.priority}</Typography>
          </Box>
          
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  color: isOverdue() ? 'error.main' : 'text.secondary' 
                }} 
              />
              <Typography 
                variant="caption"
                sx={{ color: isOverdue() ? 'error.main' : 'text.secondary' }}
              >
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        <IconButton 
          size="small" 
          onClick={handleView}
          color="primary"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={handleEdit}
          color="primary"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={handleDelete}
          color="error"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default TaskCard; 