import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
  Menu,
  MenuItem,
  CardActionArea,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PROJECT_STATUS, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '../constants/project.constants';
import { format } from 'date-fns';

const ProjectCard = ({ project, onEdit, onDelete, onManageMembers }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    navigate(`/projects/${project._id || project.projectId}`);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit(project);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete({
      ...project,
      _id: project._id || project.projectId
    });
  };

  const handleManageMembers = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onManageMembers(project);
  };

  // Calculate progress based on completed tasks vs total tasks
  const progress = project.taskStats ? 
    Math.round((project.taskStats.completed / (project.taskStats.total || 1)) * 100) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case PROJECT_STATUS.ACTIVE:
        return 'success';
      case PROJECT_STATUS.ON_HOLD:
        return 'warning';
      case PROJECT_STATUS.COMPLETED:
        return 'info';
      case PROJECT_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleCardClick}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1 }}>
              {project.name}
              {project.isPersonal && (
                <Chip 
                  label="Personal" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                />
              )}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {project.description || 'No description'}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 5 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {project.taskStats?.completed || 0} / {project.taskStats?.total || 0} tasks
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label={PROJECT_STATUS_LABELS[project.status] || project.status}
                  size="small"
                  color={PROJECT_STATUS_COLORS[project.status] || 'default'}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Members">
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {project.memberCount || 0}
                      </Typography>
                    </Box>
                  </Tooltip>
                  
                  {project.endDate && (
                    <Tooltip title="Due date">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {format(new Date(project.endDate), 'MMM d')}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
      <IconButton 
        size="small" 
        onClick={handleMenuOpen}
        sx={{ ml: 1 }}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleManageMembers}>
          <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
          Manage Members
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ProjectCard; 