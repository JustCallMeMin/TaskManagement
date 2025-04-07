import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTaskService } from '../hooks/useTaskService';
import { TASK_PRIORITY, TASK_STATUS } from '../constants';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, deleteTask, loading, error } = useTaskService();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await getTask(id);
        setTask(data);
      } catch (err) {
        console.error('Error fetching task details:', err);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id, getTask]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        navigate('/tasks');
      } catch (err) {
        console.error('Error deleting task:', err);
      }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!task) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Task not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5">Task Details</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {task.title}
            </Typography>
            <Chip 
              label={task.status} 
              color={getStatusColor(task.status)} 
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FlagIcon sx={{ mr: 1, color: getPriorityColor(task.priority) === 'default' ? 'inherit' : `${getPriorityColor(task.priority)}.main` }} />
                <Typography variant="body1" component="div">
                  Priority: <Chip size="small" label={task.priority} color={getPriorityColor(task.priority)} />
                </Typography>
              </Box>
            </Grid>
            
            {task.dueDate && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1 }} />
                  <Typography variant="body1" component="div">
                    Due Date: {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {task.assignedUserId && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="body1" component="div">
                    Assigned to: {task.assignedUserId}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {task.description || 'No description provided.'}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={() => navigate(`/tasks/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default TaskDetail; 