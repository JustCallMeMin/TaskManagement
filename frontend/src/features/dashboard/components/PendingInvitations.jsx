import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Button, Divider } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import ProjectInvitationCard from './ProjectInvitationCard';
import NotificationService from '../../notifications/services/notification.service';

const PendingInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await NotificationService.getUserNotifications();
      // Filter only project invitations
      const projectInvitations = data.filter(item => item.type === 'PROJECT_INVITED');
      setInvitations(projectInvitations);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Không thể tải danh sách lời mời dự án. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInvitations();
  }, []);
  
  const handleInvitationAction = (action, invitationId) => {
    // Remove the invitation from the list
    setInvitations(invitations.filter(inv => inv._id !== invitationId));
  };
  
  if (loading && !invitations.length) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" ml={1} color="text.secondary">
          Đang tải lời mời dự án...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchInvitations}>
            Thử lại
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }
  
  if (!invitations.length) {
    return null; // Don't display anything if there are no invitations
  }
  
  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Lời mời tham gia dự án ({invitations.length})
        </Typography>
        <Button 
          size="small" 
          startIcon={<RefreshIcon />}
          onClick={fetchInvitations}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {invitations.map(invitation => (
        <ProjectInvitationCard
          key={invitation._id}
          invitation={invitation}
          onActionComplete={handleInvitationAction}
        />
      ))}
    </Box>
  );
};

export default PendingInvitations;
