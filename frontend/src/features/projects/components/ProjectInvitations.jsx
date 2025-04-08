import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Button,
  IconButton,
  Paper,
  Divider,
  Badge,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Check as AcceptIcon,
  Close as RejectIcon, 
  Person as PersonIcon,
  Folder as ProjectIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ProjectService from '../services/project.service';

const ProjectInvitations = ({ onInvitationAction = () => {} }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ProjectService.getMyInvitations();
      setInvitations(data);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load project invitations');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);
  
  const handleAccept = async (invitationId) => {
    try {
      setLoading(true);
      await ProjectService.acceptInvitation(invitationId);
      toast.success('You have joined the project successfully');
      setInvitations(invitations.filter(inv => inv._id !== invitationId));
      onInvitationAction('accept', invitationId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async (invitationId) => {
    try {
      setLoading(true);
      await ProjectService.rejectInvitation(invitationId);
      toast.info('Project invitation rejected');
      setInvitations(invitations.filter(inv => inv._id !== invitationId));
      onInvitationAction('reject', invitationId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject invitation');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && invitations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="textSecondary" ml={1}>
          Loading invitations...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
        <Button size="small" onClick={fetchInvitations} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Alert>
    );
  }
  
  if (invitations.length === 0) {
    return (
      <Box textAlign="center" p={2}>
        <Typography variant="body2" color="textSecondary">
          No pending project invitations
        </Typography>
      </Box>
    );
  }
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ mb: 2 }}>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Badge badgeContent={invitations.length} color="primary">
            <Typography variant="h6">
              Project Invitations
            </Typography>
          </Badge>
        </Box>
        <Button 
          size="small" 
          onClick={fetchInvitations} 
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      <Divider />
      <List disablePadding>
        {invitations.map((invitation) => (
          <React.Fragment key={invitation._id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>
                  <ProjectIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {invitation.projectId?.name || 'Unnamed Project'}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" component="span" color="textPrimary">
                      Invited by: {invitation.invitedBy?.fullName || 'Unknown'}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(invitation.createdAt).toLocaleString()}
                    </Typography>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <Box display="flex">
                  <Tooltip title="Accept invitation">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleAccept(invitation._id)} 
                      disabled={loading}
                      color="primary"
                    >
                      <AcceptIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject invitation">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleReject(invitation._id)} 
                      disabled={loading}
                      color="error"
                    >
                      <RejectIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ProjectInvitations;
