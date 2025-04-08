import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowBack as BackIcon, AddCircle as AddCircleIcon } from '@mui/icons-material';
import { TASK_STATUS, TASK_PRIORITY } from '../constants';
import { useTaskService } from '../hooks/useTaskService';
import ProjectService from '../../projects/services/project.service';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, createTask, updateTask } = useTaskService();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: '',
    projectId: ''
  });

  const [projects, setProjects] = useState([]);

  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('projectId');

  useEffect(() => {
    const fetchTask = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const taskData = await getTask(id);
        if (taskData) {
          setFormData({
            ...taskData,
            dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
            projectId: taskData.projectId || ''
          });
        }
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id, getTask, isEditMode]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await ProjectService.getAllProjects();
        setProjects(projectsData || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectIdFromUrl && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        projectId: projectIdFromUrl
      }));
    }
  }, [projectIdFromUrl, isEditMode]);

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
      setLoading(true);
      if (isEditMode) {
        await updateTask(id, formData);
      } else {
        await createTask(formData);
      }
      navigate('/tasks');
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5">
          {isEditMode ? 'Edit Task' : 'Create New Task'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Project</InputLabel>
                <Select
                  name="projectId"
                  value={formData.projectId || ''}
                  onChange={handleChange}
                  label="Project"
                >
                  <MenuItem value="">
                    <em>Personal Task (No Project)</em>
                  </MenuItem>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled sx={{ color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <em>No projects available - </em>
                        <Link 
                          to="/projects" 
                          style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', textDecoration: 'none' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AddCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Create Project
                        </Link>
                      </Box>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {Object.entries(TASK_STATUS).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {value.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
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
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  type="button"
                  onClick={() => navigate('/tasks')}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} /> 
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </> : 
                    (isEditMode ? 'Update Task' : 'Create Task')
                  }
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskForm; 