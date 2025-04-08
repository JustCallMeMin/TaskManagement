import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
  Autocomplete,
  Tooltip
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
  const [searchResults, setSearchResults] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && project) {
      // Check if project has a valid ID before fetching
      if (project._id || project.projectId) {
        fetchMembers();
        // Không tải tất cả người dùng nữa
        setSearchResults([]);
        setSearchTerm('');
      } else {
        console.warn('Project object has no valid ID', project);
        setError('Unable to manage members: Project information is incomplete.');
      }
    }
  }, [open, project]);

  // Thêm debounce search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchUsers(searchTerm);
      } else if (searchTerm.trim().length === 0) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

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

  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) return;
    
    setSearching(true);
    try {
      setError(''); // Clear any previous errors
      const data = await userService.searchUsers(query.trim());
      
      // Lọc bỏ những người dùng đã là thành viên
      const memberIds = members.map(m => m._id || m.userId);
      const filteredUsers = data.filter(user => !memberIds.includes(user._id));
      
      setSearchResults(filteredUsers);
      if (filteredUsers.length === 0 && data.length > 0) {
        setError('All matching users are already members of this project.');
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search for users. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }
    
    if (!project || !project._id) {
      setError('Invalid project data');
      return;
    }
    
    const projectId = project._id || project.projectId;
    // Xác định đúng userId của thành viên cần xóa
    const userId = member.userId || member._id;
    
    console.log('Removing member with userId:', userId);
    
    setLoading(true);
    try {
      await ProjectService.removeMembers(projectId, [userId]);
      // Lọc thành viên dựa trên _id hoặc userId tùy vào cấu trúc dữ liệu
      setMembers(members.filter(m => 
        (m._id !== member._id) && 
        (m.userId !== userId)
      ));
      setError('');
      onChange(); // Notify parent component of the change
      // Cập nhật lại danh sách thành viên
      fetchMembers();
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      // Chỉ trích xuất mảng các userId, không gửi đối tượng phức tạp
      const memberIds = selectedUsers.map(user => user._id);
      
      const result = await ProjectService.addMembers(project._id, memberIds);
      
      // Show success message
      toast.success(
        `Invitation${memberIds.length > 1 ? 's' : ''} sent to ${memberIds.length} user${memberIds.length > 1 ? 's' : ''}.`,
        {autoClose: 3000}
      );
      
      // Refresh members list and reset form
      fetchMembers();
      setSelectedUsers([]);
      setSearchTerm('');
      setError('');
      onChange(); // Notify parent component of the change
    } catch (err) {
      console.error('Error sending invitations:', err);
      // Get friendly error message from response
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to send invitations';
      
      // Show as toast instead of error state for better user experience
      if (errorMsg.includes('đã là thành viên') || errorMsg.includes('đã được mời')) {
        toast.info('Người dùng đã là thành viên hoặc đã được mời tham gia dự án này.', {
          autoClose: 5000
        });
      } else {
        toast.error(errorMsg, {
          autoClose: 5000
        });
      }
      
      // Clear search and selection after error feedback
      setSelectedUsers([]);
      setSearchTerm('');
    } finally {
      setLoading(false);
    }
  };

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
          <Alert severity="info" sx={{ mb: 2 }}>
            Users will need to accept your invitation before they become project members.
          </Alert>
          <Typography variant="subtitle1" gutterBottom>
            Invite New Members
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Autocomplete
              multiple
              options={searchResults}
              getOptionLabel={(option) => option.fullName || option.email}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Search Users"
                  placeholder="Search users..."
                  fullWidth
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {searching ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tagProps = getTagProps({ index });
                  const { key, ...chipProps } = tagProps;
                  return (
                    <Chip
                      key={key}
                      avatar={<Avatar>{option.fullName ? option.fullName.charAt(0) : option.email.charAt(0)}</Avatar>}
                      label={option.fullName || option.email}
                      {...chipProps}
                      size="small"
                    />
                  );
                })
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
              Invite
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
                  <Tooltip title="Xóa thành viên">
                    <span> {/* Bao bọc IconButton trong span để tooltip vẫn hiển thị khi nút bị vô hiệu hóa */}
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveMember(member)}
                        disabled={loading || 
                          // Kiểm tra các trường hợp khác nhau của ID chủ sở hữu
                          (project.ownerId?._id && member._id === project.ownerId._id) || 
                          (typeof project.ownerId === 'string' && member._id === project.ownerId) ||
                          (member.userId === project.ownerId)}
                        color="error"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
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