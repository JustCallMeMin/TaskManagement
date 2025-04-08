import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  TextField,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  PersonRemove as RemoveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import ProjectService from '../services/project.service';
import { userService } from '../../users/services/user.service';

const ProjectMembersDialog = ({ open, onClose, onChange, project }) => {
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && project) {
      // Check if project has a valid ID before fetching
      if (project._id || project.projectId) {
        fetchMembers();
        fetchAvailableUsers();
      } else {
        console.warn('Project object has no valid ID', project);
        setError('Unable to manage members: Project information is incomplete.');
      }
    }
  }, [open, project]);

  const fetchMembers = async () => {
    if (!project) {
      console.warn('No project provided to ProjectMembersDialog');
      return;
    }
    
    const projectId = project._id || project.projectId;
    if (!projectId) {
      console.warn('Project has no ID', project);
      setError('Unable to load members: Project ID is missing.');
      return;
    }
    
    console.log(`Fetching members for project: ${projectId}`);
    
    setMembersLoading(true);
    try {
      const data = await ProjectService.getProjectMembers(projectId);
      setMembers(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching project members:', err);
      setError('Failed to load project members');
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setError(''); // Clear any previous errors
      const data = await userService.getAllUsers();
      if (Array.isArray(data)) {
        setAvailableUsers(data);
        if (data.length === 0) {
          setError('No users available to add to this project. You may not have permission to view all users.');
        }
      } else {
        console.warn('User data is not an array:', data);
        setAvailableUsers([]);
        setError('Unable to load available users. You may not have sufficient permissions.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Unable to load available users. You may not have sufficient permissions.');
      setAvailableUsers([]);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }
    
    if (!project || !project._id) {
      setError('Invalid project data');
      return;
    }
    
    const projectId = project._id || project.projectId;
    
    setLoading(true);
    try {
      await ProjectService.removeMembers(projectId, [userId]);
      setMembers(members.filter(member => member.userId !== userId));
      setError('');
      onChange(); // Notify parent component of the change
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      const memberData = selectedUsers.map(user => ({
        userId: user._id,
        role: 'member'
      }));
      
      await ProjectService.addMembers(project._id, memberData);
      fetchMembers();
      setSelectedUsers([]);
      setError('');
      onChange(); // Notify parent component of the change
    } catch (err) {
      console.error('Error adding members:', err);
      setError('Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  // Filter out already added members from available users
  const filteredUsers = availableUsers.filter(
    user => !members.some(member => member._id === user._id)
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              Manage Project Members
            </Typography>
            {project && <Typography variant="body2" color="textSecondary">
              {project.name}
            </Typography>}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert 
            severity={error.includes('permission') ? "info" : "error"} 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Members
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Autocomplete
              multiple
              options={filteredUsers}
              getOptionLabel={(option) => option.fullName || option.email}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select Users"
                  placeholder="Search users..."
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    avatar={<Avatar>{option.fullName ? option.fullName.charAt(0) : option.email.charAt(0)}</Avatar>}
                    label={option.fullName || option.email}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
              sx={{ flexGrow: 1, mr: 1 }}
              disabled={loading}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || loading}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Current Members {membersLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </Typography>
        
        {members.length === 0 && !membersLoading ? (
          <Typography variant="body2" color="text.secondary" sx={{ my: 2, textAlign: 'center' }}>
            No members in this project
          </Typography>
        ) : (
          <List>
            {members.map((member) => (
              <ListItem key={member._id}>
                <ListItemAvatar>
                  <Avatar>{member.fullName ? member.fullName.charAt(0) : member.email.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.fullName || member.email}
                  secondary={member.email}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveMember(member._id)}
                    disabled={loading || member._id === project.ownerId}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectMembersDialog; 