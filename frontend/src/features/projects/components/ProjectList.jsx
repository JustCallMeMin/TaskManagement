import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Fab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import ProjectMembersDialog from './ProjectMembersDialog';
import ProjectService from '../services/project.service';
import { PROJECT_STATUS } from '../constants/project.constants';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [membersProject, setMembersProject] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await ProjectService.getAllProjects();
      setProjects(data);
      setFilteredProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let result = [...projects];
    
    // Filter by search term
    if (searchTerm.trim()) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(result);
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setOpenForm(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setOpenForm(true);
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      return;
    }
    
    try {
      await ProjectService.deleteProjects([project._id]);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const handleFormSubmit = async (projectData) => {
    try {
      if (selectedProject) {
        await ProjectService.updateProject(selectedProject._id, projectData);
      } else {
        await ProjectService.createProject(projectData);
      }
      setOpenForm(false);
      fetchProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project. Please check your inputs and try again.');
    }
  };

  const handleManageMembers = (project) => {
    setMembersProject(project);
    setOpenMembersDialog(true);
  };

  const handleMembersChange = () => {
    fetchProjects();
    setOpenMembersDialog(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          New Project
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            {Object.values(PROJECT_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter 
              ? 'Try adjusting your filters' 
              : 'Create your first project to get started'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
            sx={{ mt: 2 }}
          >
            Create Project
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map(project => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <ProjectCard
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onManageMembers={handleManageMembers}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreateProject}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
      >
        <AddIcon />
      </Fab>

      {openForm && (
        <ProjectForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit}
          project={selectedProject}
        />
      )}

      {openMembersDialog && membersProject && (
        <ProjectMembersDialog
          open={openMembersDialog}
          onClose={() => setOpenMembersDialog(false)}
          onChange={handleMembersChange}
          project={membersProject}
        />
      )}
    </Box>
  );
};

export default ProjectList; 