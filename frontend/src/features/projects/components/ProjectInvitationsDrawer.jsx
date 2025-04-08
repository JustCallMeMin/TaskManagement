import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import NotificationService from '../../notifications/services/notification.service';

const ProjectInvitationsDrawer = () => {
  const [open, setOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvitations = useCallback(async () => {
    // Always fetch to ensure we have latest data
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user invitations...');
      // Use no-cache to ensure we get fresh data
      const data = await NotificationService.getUserNotifications();
      console.log('Received notifications:', data);
      
      // Filter to get only project invitations
      // Chỉ lấy những lời mời có trạng thái PENDING (chú ý so sánh cả uppercase và lowercase)
      const projectInvites = data.filter(item => {
        const isInvitation = item.type === 'PROJECT_INVITED';
        const isPending = item.status?.toLowerCase() === 'pending';
        
        console.log(`Invitation ${item._id}: ${item.type}, status: ${item.status}, isPending: ${isPending}`);
        return isInvitation && isPending;
      });
      
      console.log('Filtered project invitations:', projectInvites);
      setInvitations(projectInvites);
      
      // Thêm cả logging raw data để kiểm tra tất cả invitations trả về
      console.log('Raw data from API:', data);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Không thể tải lời mời dự án. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up a timer to periodically refresh invitations
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchInvitations();
    }, 10000); // Refresh even more frequently (every 10 seconds)
    
    // Listen for custom events to refresh invitations
    const handleProjectChange = () => {
      console.log('Project membership changed event received - refreshing invitations');
      fetchInvitations();
    };
    
    const handleInvitationStatus = (event) => {
      console.log('Invitation status changed event received:', event.detail);
      // Immediately refresh the invitations list
      fetchInvitations();
      
      // If an invitation was accepted, also reload the project list
      if (event.detail?.accepted) {
        // Force reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };
    
    // Register all event listeners
    window.addEventListener('projectMembershipChanged', handleProjectChange);
    window.addEventListener('invitationRejected', handleProjectChange);
    window.addEventListener('invitationStatusChanged', handleInvitationStatus);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('projectMembershipChanged', handleProjectChange);
      window.removeEventListener('invitationRejected', handleProjectChange);
      window.removeEventListener('invitationStatusChanged', handleInvitationStatus);
    };
  }, [fetchInvitations]);

  useEffect(() => {
    fetchInvitations();
  }, [open]);

  const handleAccept = async (invitationId) => {
    try {
      setLoading(true);
      
      // Update local state immediately for responsive UI
      setInvitations(prevInvitations => 
        prevInvitations.filter(invite => invite._id !== invitationId)
      );
      
      // Show a success toast right away for better UX
      const toastId = toast.success('Đang xử lý...', { autoClose: false });
      
      // Pass a callback that will execute after the API call
      await NotificationService.handleInvitationResponse(invitationId, true, (accepted, result) => {
        // Update toast with success message
        toast.update(toastId, {
          render: 'Bạn đã chấp nhận lời mời dự án!',
          type: toast.TYPE.SUCCESS,
          autoClose: 3000
        });
        
        // Since we're now forcing a reload in the service for reliability,
        // we don't need to do anything else here - the page will refresh
        
        // But for backward compatibility, still fetch invitations
        setTimeout(() => {
          fetchInvitations();
          window.dispatchEvent(new CustomEvent('projectMembershipChanged'));
        }, 500);
      });
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast.error('Không thể chấp nhận lời mời. Vui lòng thử lại sau.');
      
      // Refresh invitations if there was an error
      fetchInvitations();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (invitationId) => {
    try {
      setLoading(true);
      
      // Update local state immediately for responsive UI
      setInvitations(prevInvitations => 
        prevInvitations.filter(invite => invite._id !== invitationId)
      );
      
      // Show an info toast right away for better UX
      const toastId = toast.info('Đang xử lý...', { autoClose: false });
      
      // Pass a callback that will execute after the API call
      await NotificationService.handleInvitationResponse(invitationId, false, () => {
        // Update toast with success message
        toast.update(toastId, {
          render: 'Bạn đã từ chối lời mời dự án.',
          type: toast.TYPE.INFO,
          autoClose: 3000
        });
        
        // Refresh notifications and dispatch event to update other components
        setTimeout(() => {
          fetchInvitations();
          window.dispatchEvent(new CustomEvent('invitationRejected'));
        }, 500);
      });
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      toast.error('Không thể từ chối lời mời. Vui lòng thử lại sau.');
      
      // Refresh invitations if there was an error
      fetchInvitations();
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={toggleDrawer}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20,
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          boxShadow: 3
        }}
      >
        <Badge badgeContent={invitations.length} color="error">
          <PersonAddIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Lời mời dự án
              {invitations.length > 0 && ` (${invitations.length})`}
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
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
          ) : invitations.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Bạn không có lời mời dự án nào
              </Typography>
            </Box>
          ) : (
            <List>
              {invitations.map((invitation) => (
                <React.Fragment key={invitation._id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <FolderIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="div">
                          {invitation.content}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" color="text.secondary" component="div">
                            {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true, locale: vi })}
                          </Typography>
                          <Box mt={1} display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<AcceptIcon />}
                              onClick={() => {
                                console.log('Clicking Accept with ID:', invitation._id);
                                // Debugging - hiển thị toàn bộ invitation để kiểm tra
                                console.log('Full invitation object:', invitation);
                                // Sửa: sử dụng _id thay vì referenceId
                                handleAccept(invitation._id);
                              }}
                            >
                              Đồng ý
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<RejectIcon />}
                              onClick={() => {
                                console.log('Clicking Reject with ID:', invitation._id);
                                console.log('Full invitation object for rejection:', invitation);
                                // Sửa: sử dụng _id thay vì referenceId
                                handleReject(invitation._id);
                              }}
                            >
                              Từ chối
                            </Button>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default ProjectInvitationsDrawer;
