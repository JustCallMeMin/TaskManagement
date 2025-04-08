import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as TeamIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import ProjectService from '../services/project.service';
import TaskService from '../../tasks/services/task.service';
import TaskList from '../../tasks/components/TaskList';
import ProjectForm from './ProjectForm';
import ProjectMembersDialog from './ProjectMembersDialog';
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '../constants/project.constants';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const projectData = await ProjectService.getProjectById(projectId);
      setProject(projectData);
      
      // Fetch members and tasks once we have project data
      Promise.all([
        ProjectService.getProjectMembers(projectId),
        TaskService.getTasksByProject(projectId)
      ]).then(([membersData, tasksData]) => {
        setMembers(membersData || []);
        setTasks(tasksData || []);
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBackClick = () => {
    navigate('/projects');
  };

  const handleEditClick = () => {
    setOpenEditForm(true);
  };

  const handleManageMembers = () => {
    setOpenMembersDialog(true);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to delete ${project.name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await ProjectService.deleteProjects([projectId]);
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const handleProjectUpdate = async (projectData) => {
    try {
      await ProjectService.updateProject(projectId, projectData);
      fetchProject();
      setOpenEditForm(false);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
    }
  };

  const handleMembersChange = () => {
    fetchProject();
    setOpenMembersDialog(false);
  };

  const handleCreateTask = () => {
    navigate(`/tasks/new?projectId=${projectId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Project not found
      </Alert>
    );
  }

  // Calculate stats
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleBackClick} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          {project.name}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleManageMembers}
            startIcon={<TeamIcon />}
            sx={{ mr: 1 }}
          >
            Manage Team
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEditClick}
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteProject}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={PROJECT_STATUS_LABELS[project.status] || project.status} 
                  color={PROJECT_STATUS_COLORS[project.status] || 'default'}
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {project.description || 'No description provided'}
              </Typography>
              
              {(project.startDate || project.endDate) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not set'} 
                    {' - '}
                    {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'Not set'}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ height: 8, borderRadius: 5, mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {completedTasks} of {totalTasks} tasks completed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Team Members ({members.length})
                </Typography>
                <IconButton size="small" onClick={handleManageMembers} color="primary">
                  <TeamIcon />
                </IconButton>
              </Box>
              
              {members.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No team members yet
                </Typography>
              ) : (
                <List disablePadding>
                  {members.map(member => (
                    <ListItem key={member._id} disablePadding sx={{ pb: 1 }}>
                      <ListItemAvatar>
                        <Avatar>
                          {member.fullName ? member.fullName.charAt(0) : member.email.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.fullName || 'Unnamed User'}
                        secondary={member.email}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {member._id === project.ownerId && (
                        <Chip label="Owner" size="small" color="primary" variant="outlined" />
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Tasks" />
              <Tab label="Activity" />
            </Tabs>
          </Paper>
          
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Project Tasks
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateTask}
                >
                  Add Task
                </Button>
              </Box>
              
              {tasks.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No tasks in this project yet
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateTask}
                  >
                    Create First Task
                  </Button>
                </Paper>
              ) : (
                <TaskList 
                  tasks={tasks} 
                  onTaskUpdated={fetchProject}
                  projectId={projectId}
                  showFilters={false}
                />
              )}
            </Box>
          )}
          
          {tabValue === 1 && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Activity feed will be implemented in a future update
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {openEditForm && (
        <ProjectForm
          open={openEditForm}
          onClose={() => setOpenEditForm(false)}
          onSubmit={handleProjectUpdate}
          project={project}
        />
      )}

      {openMembersDialog && (
        <ProjectMembersDialog
          open={openMembersDialog}
          onClose={() => setOpenMembersDialog(false)}
          onChange={handleMembersChange}
          project={project}
        />
      )}
    </Box>
  );
};

export default ProjectDetail; 