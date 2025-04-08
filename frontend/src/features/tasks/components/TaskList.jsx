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

const TaskList = ({ tasks: propTasks, onTaskUpdated, projectId, showFilters = true }) => {
  const navigate = useNavigate();
  const { getTasks, deleteTask, loading: serviceLoading, error: serviceError } = useTaskService();
  const [tasks, setTasks] = React.useState(propTasks || []);
  const [loading, setLoading] = React.useState(!propTasks);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    // If tasks are provided via props, use those
    if (propTasks) {
      setTasks(propTasks);
      setLoading(false);
      return;
    }
    
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const data = await getTasks();
        setTasks(data || []);
        setError(null);
      } catch (err) {
        // Handle 404 error as an empty list, not an error
        if (err.response && err.response.status === 404) {
          console.log('No tasks found (404), showing empty state');
          setTasks([]);
          setError(null);
        } else {
          console.error('Error fetching tasks:', err);
          setTasks([]);
          setError('Failed to load tasks');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [getTasks, propTasks]);

  // Update local tasks when prop tasks change
  useEffect(() => {
    if (propTasks) {
      setTasks(propTasks);
    }
  }, [propTasks]);

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      // Filter out the deleted task, considering both id and _id properties
      setTasks(tasks.filter(task => (task._id !== id && task.id !== id)));
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
          {projectId ? 'Project Tasks' : 'My Tasks'}
        </Typography>
        {/* Only show the Add Task button when not in project view - prevents duplicate buttons */}
        {!projectId && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
          >
            New Task
          </Button>
        )}
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
              key={task._id || task.id}
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
                    onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                    sx={{ mr: 1 }}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => navigate(`/tasks/${task._id || task.id}/edit`)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(task._id || task.id)}
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