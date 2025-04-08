import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge, Avatar, Tooltip, Menu, MenuItem, List, ListItem, ListItemText, ListItemAvatar, Divider, Button, CircularProgress, Alert } from '@mui/material';
import { NotificationsOutlined, Search as SearchIcon, MoreVert as MoreIcon, Logout as LogoutIcon, Check, Close, DoneAll, Settings, Info, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import './Header.css';
import { useAuth } from '../../../features/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NotificationService from '../../../features/notifications/services/notification.service';

const Header = ({ isAdmin = false, className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  
  // Số thông báo chưa đọc
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load thông báo khi component được tải
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      // Sử dụng NotificationService để lấy thông báo thật từ hệ thống
      const data = await NotificationService.getUserNotifications();
      setNotifications(data);
      setNotificationError('');
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotificationError('Không thể tải thông báo');
    } finally {
      setLoadingNotifications(false);
    }
  };
  
  useEffect(() => {
    loadNotifications();
    
    // Cập nhật thông báo mỗi 15 giây (tăng tần suất cập nhật)
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Xử lý mở/đóng menu thông báo
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Đánh dấu thông báo đã đọc
  const handleMarkAsRead = (notificationId) => {
    // Trong thực tế, gọi API để đánh dấu thông báo đã đọc
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification._id === notificationId 
          ? {...notification, isRead: true}
          : notification
      )
    );
  };
  
  // Đánh dấu tất cả thông báo đã đọc
  const handleMarkAllAsRead = () => {
    // Trong thực tế, gọi API để đánh dấu tất cả thông báo đã đọc
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({...notification, isRead: true}))
    );
  };
  
  // Xử lý chấp nhận lời mời tham gia dự án
  const handleAcceptInvitation = async (notificationId) => {
    try {
      // Cập nhật UI ngay lập tức để trải nghiệm người dùng tốt hơn
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? {...notification, status: 'accepted', isRead: true}
            : notification
        )
      );
      
      // Hiển thị thông báo đang xử lý
      const toastId = toast.info('Đang xử lý chấp nhận lời mời...', { autoClose: false });
      
      // Tìm thông báo cần xử lý
      const targetNotification = notifications.find(n => n._id === notificationId);
      
      if (!targetNotification || !targetNotification.referenceId) {
        toast.error('Không thể xác định lời mời');
        return;
      }
      
      // Gọi API thực sự để chấp nhận lời mời
      console.log('Chấp nhận lời mời với ID:', targetNotification.referenceId);
      await NotificationService.handleInvitationResponse(targetNotification.referenceId, true, (accepted) => {
        if (accepted) {
          // Cập nhật toast thành công
          toast.update(toastId, {
            render: 'Đã chấp nhận lời mời dự án thành công!',
            type: 'success',
            autoClose: 3000
          });
          
          // Tải lại thông báo
          loadNotifications();
          
          // Làm mới trang sau 1 giây để hiển thị dự án mới
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Lỗi khi chấp nhận lời mời:', error);
      toast.error('Không thể chấp nhận lời mời. Vui lòng thử lại sau.');
    }
  };
  
  // Xử lý từ chối lời mời tham gia dự án
  const handleDeclineInvitation = async (notificationId) => {
    try {
      // Cập nhật UI ngay lập tức để trải nghiệm người dùng tốt hơn
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? {...notification, status: 'declined', isRead: true}
            : notification
        )
      );
      
      // Hiển thị thông báo đang xử lý
      const toastId = toast.info('Đang xử lý từ chối lời mời...', { autoClose: false });
      
      // Tìm thông báo cần xử lý
      const targetNotification = notifications.find(n => n._id === notificationId);
      
      if (!targetNotification || !targetNotification.referenceId) {
        toast.error('Không thể xác định lời mời');
        return;
      }
      
      // Gọi API thực sự để từ chối lời mời
      console.log('Từ chối lời mời với ID:', targetNotification.referenceId);
      await NotificationService.handleInvitationResponse(targetNotification.referenceId, false, (accepted) => {
        // Cập nhật toast thành công
        toast.update(toastId, {
          render: 'Đã từ chối lời mời dự án',
          type: 'info',
          autoClose: 3000
        });
        
        // Tải lại thông báo
        loadNotifications();
      });
    } catch (error) {
      console.error('Lỗi khi từ chối lời mời:', error);
      toast.error('Không thể từ chối lời mời. Vui lòng thử lại sau.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still close the menu even if logout fails
      handleClose();
    }
  };
  
  return (
    <AppBar position="sticky" color="default" elevation={0} className={`header ${className}`}>
      <Toolbar sx={isAdmin ? { justifyContent: 'flex-start' } : {}}>
        <Typography 
          variant="h6" 
          component="div" 
          className={isAdmin ? 'admin-title' : ''}
          sx={{ 
            flexGrow: 0, 
            display: { xs: 'none', sm: 'block' }, 
            mr: 2,
            fontWeight: isAdmin ? 500 : 400,
          }}
        >
          {isAdmin ? 'Admin Dashboard' : 'Task Management'}
        </Typography>
        
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
          />
        </div>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Tooltip title="Thông báo">
            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Menu hiển thị thông báo */}
          <Menu
            id="notification-menu"
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              style: {
                maxHeight: 400,
                width: 360,
              },
              elevation: 3,
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Thông báo</Typography>
              {unreadCount > 0 && (
                <Button 
                  size="small" 
                  startIcon={<DoneAll />} 
                  onClick={handleMarkAllAsRead}
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </Box>
            <Divider />
            
            {loadingNotifications ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : notificationError ? (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">{notificationError}</Alert>
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Bạn không có thông báo nào
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification) => {
                  const isInvitation = notification.type === 'PROJECT_INVITED' && notification.status === 'pending';
                  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi });
                  
                  return (
                    <React.Fragment key={notification._id}>
                      <ListItem 
                        alignItems="flex-start"
                        sx={{
                          backgroundColor: notification.isRead ? 'inherit' : 'rgba(144, 202, 249, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          cursor: 'pointer',
                        }}
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {notification.type === 'PROJECT_INVITED' ? <PersonAddIcon /> : 
                             notification.type === 'TASK_ASSIGNED' ? <Settings /> : 
                             notification.type === 'TASK_COMPLETED' ? <Check /> : 
                             <Info />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                              {notification.content}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" color="text.secondary" component="span">
                                {timeAgo}
                              </Typography>
                              
                              {isInvitation && (
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={<Check />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAcceptInvitation(notification._id);
                                    }}
                                  >
                                    Chấp nhận
                                  </Button>
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="error"
                                    startIcon={<Close />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeclineInvitation(notification._id);
                                    }}
                                  >
                                    Từ chối
                                  </Button>
                                </Box>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            )}
            
            <Divider />
            <MenuItem onClick={() => { handleNotificationMenuClose(); navigate('/notifications'); }}>
              <ListItemText primary="Xem tất cả thông báo" />
            </MenuItem>
          </Menu>
          
          <Tooltip title={user?.name || 'Profile'}>
            <IconButton 
              edge="end" 
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                alt={user?.name || 'User'} 
                src={user?.avatar || ''} 
                sx={{ width: 32, height: 32 }}
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
        
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            aria-label="show more"
            aria-haspopup="true"
            color="inherit"
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 