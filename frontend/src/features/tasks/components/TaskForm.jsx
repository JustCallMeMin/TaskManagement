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
  const [personalProject, setPersonalProject] = useState(null);

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
        
        // Separate personal project from organization projects
        if (projectsData && projectsData.length > 0) {
          const personal = projectsData.find(project => project.isPersonal);
          const others = projectsData.filter(project => !project.isPersonal);
          
          if (personal) {
            setPersonalProject(personal);
          }
          
          setProjects(others);
        }
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
      
      // Prepare data for submission, ensuring all required fields are set
      const taskData = {
        ...formData,
        // Ensure priority is set
        priority: formData.priority || TASK_PRIORITY.MEDIUM,
        // Ensure status is set
        status: formData.status || TASK_STATUS.TODO,
        // Set isPersonal flag based on projectId
        isPersonal: !formData.projectId || formData.projectId === '',
      };
      
      // Validate the due date if it's set
      if (taskData.dueDate) {
        const dueDate = new Date(taskData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
        
        if (dueDate <= today) {
          setError("Due date must be in the future");
          setLoading(false);
          return;
        }
      }
      
      console.log("Submitting task data:", taskData);
      
      if (isEditMode) {
        await updateTask(id, taskData);
      } else {
        await createTask(taskData);
      }
      
      // Check if we came from a specific project page
      if (projectIdFromUrl) {
        navigate(`/projects/${projectIdFromUrl}`);
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Back button click handler with context awareness
  const handleBackClick = () => {
    if (projectIdFromUrl) {
      navigate(`/projects/${projectIdFromUrl}`);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleBackClick} sx={{ mr: 1 }}>
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
                  {personalProject && (
                    <MenuItem value={personalProject._id}>
                      Personal Task ({personalProject.name})
                    </MenuItem>
                  )}
                  
                  {projects.length > 0 && [
                    <MenuItem key="divider" disabled>
                      --- Organization Projects ---
                    </MenuItem>,
                    ...projects.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.name}
                      </MenuItem>
                    ))
                  ]}
                  
                  {!personalProject && projects.length === 0 && (
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
                  onClick={handleBackClick}
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
                    </>
                    : 
                    isEditMode ? 'Update Task' : 'Create Task'
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