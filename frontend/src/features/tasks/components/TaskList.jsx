import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  VisibilityOutlined as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTaskService } from '../hooks/useTaskService';
import { TASK_PRIORITY, TASK_STATUS } from '../constants';

const TaskList = () => {
  const navigate = useNavigate();
  const { getTasks, deleteTask, loading, error } = useTaskService();
  const [tasks, setTasks] = React.useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data || []);
      } catch (err) {
        // We'll let the useTaskService hook handle error display
        // Only log non-404 errors to console
        if (!err.response || err.response.status !== 404) {
          console.error('Error fetching tasks:', err);
        }
        // Set tasks to empty array to ensure we still render the empty state
        setTasks([]);
      }
    };
    fetchTasks();
  }, [getTasks]);

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
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

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          My Tasks
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
        >
          New Task
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : tasks.length === 0 ? (
        <Box textAlign="center" p={4}>
          <Typography color="textSecondary" paragraph>
            No tasks found. Create your first task to get started!
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
            sx={{ mt: 2 }}
          >
            Create Task
          </Button>
        </Box>
      ) : (
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task._id}
              sx={{
                mb: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1,
                p: 2
              }}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="view"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    sx={{ mr: 1 }}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => navigate(`/tasks/${task._id}/edit`)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(task._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <Box sx={{ pr: 12, width: '100%' }}>
                <Typography variant="h6" component="div">
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {task.description.length > 120 
                      ? `${task.description.substring(0, 120)}...` 
                      : task.description}
                  </Typography>
                )}
                <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={task.status} 
                    size="small" 
                    color={getStatusColor(task.status)}
                    variant="outlined" 
                  />
                  <Chip 
                    label={task.priority} 
                    size="small" 
                    color={getPriorityColor(task.priority)} 
                    variant="outlined"
                  />
                  {task.dueDate && (
                    <Chip
                      label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                      size="small"
                      variant="outlined"
                      color={new Date(task.dueDate) < new Date() ? "error" : "default"}
                    />
                  )}
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TaskList; 