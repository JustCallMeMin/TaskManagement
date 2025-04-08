import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Avatar, Chip, Divider, CircularProgress } from '@mui/material';
import { Check as AcceptIcon, Close as RejectIcon, Person as PersonIcon, Folder as ProjectIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import NotificationService from '../../notifications/services/notification.service';

const ProjectInvitationCard = ({ invitation, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  
  const handleAccept = async () => {
    setLoading(true);
    try {
      await NotificationService.handleInvitationResponse(invitation._id, true);
      toast.success(`Bạn đã tham gia dự án "${invitation.projectId?.name || 'Unnamed Project'}"!`);
      if (onActionComplete) onActionComplete('accept', invitation._id);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi chấp nhận lời mời. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    setLoading(true);
    try {
      await NotificationService.handleInvitationResponse(invitation._id, false);
      toast.info('Bạn đã từ chối lời mời tham gia dự án.');
      if (onActionComplete) onActionComplete('reject', invitation._id);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi từ chối lời mời. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <ProjectIcon />
          </Avatar>
          
          <Box flexGrow={1}>
            <Typography variant="h6" component="div">
              {invitation.projectId?.name || 'Unnamed Project'}
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {invitation.projectId?.description?.substring(0, 100) || 'No description'}
              {invitation.projectId?.description?.length > 100 ? '...' : ''}
            </Typography>
          </Box>
          
          <Chip 
            label="Lời mời mới" 
            color="primary" 
            size="small"
            variant="outlined"
          />
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar
              src={invitation.invitedBy?.avatar || ''}
              sx={{ mr: 1, width: 24, height: 24 }}
            >
              {invitation.invitedBy?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2">
              Được mời bởi {invitation.invitedBy?.fullName || 'Unknown User'}
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(invitation.createdAt), { 
              addSuffix: true,
              locale: vi 
            })}
          </Typography>
        </Box>
        
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={handleReject}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Từ chối
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AcceptIcon />}
            onClick={handleAccept}
            disabled={loading}
          >
            Tham gia
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectInvitationCard;
