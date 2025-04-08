import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge, Avatar, Tooltip, Menu, MenuItem } from '@mui/material';
import { NotificationsOutlined, Search as SearchIcon, MoreVert as MoreIcon, Logout as LogoutIcon } from '@mui/icons-material';
import './Header.css';
import { useAuth } from '../../../features/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ isAdmin = false, className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton>
          </Tooltip>
          
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