import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  FolderSpecial as ProjectsIcon,
  Task as TasksIcon,
  Timeline as TimelineIcon,
  Message as MessageIcon,
  Notifications as NotifyIcon,
  Settings as SettingsIcon,
  Folder as FilesIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../features/auth/contexts/AuthContext';
import './Sidebar.css';

const UserSidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const { loading } = useAuth();
  
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.startsWith('/tasks')) {
      setActiveItem('tasks');
    } else if (path.startsWith('/projects')) {
      setActiveItem('projects');
    } else if (path.startsWith('/timeline')) {
      setActiveItem('timeline');
    } else if (path.startsWith('/messages')) {
      setActiveItem('message');
    } else if (path.startsWith('/notifications')) {
      setActiveItem('notify');
    } else if (path.startsWith('/settings')) {
      setActiveItem('settings');
    } else if (path.startsWith('/files')) {
      setActiveItem('files');
    }
  }, [location]);

  // User menu items
  const userMenuItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
    { id: 'projects', icon: <ProjectsIcon />, label: 'Projects', path: '/projects' },
    { id: 'tasks', icon: <TasksIcon />, label: 'Tasks', path: '/tasks' },
    { id: 'timeline', icon: <TimelineIcon />, label: 'Timeline', path: '/timeline' },
    { id: 'message', icon: <MessageIcon />, label: 'Message', path: '/messages' },
    { id: 'notify', icon: <NotifyIcon />, label: 'Notify', path: '/notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
    { id: 'files', icon: <FilesIcon />, label: 'Files', path: '/files' },
  ];
  
  // Handle loading state in render
  if (loading) {
    console.log('UserSidebar waiting for auth to complete...');
    return null;
  }

  return (
    <Box className="sidebar">
      <Link to="/" className="logo">
        <img src="/assets/images/logo.svg" alt="Logo" className="logo-image" />
      </Link>
      <div className="menu">
        {userMenuItems.map((item) => (
          <Link 
            to={item.path} 
            key={item.id}
            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item.id)}
            style={{ textDecoration: 'none' }}
          >
            <div className="menu-item-content">
              {item.icon}
              <span className="menu-item-label">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </Box>
  );
};

export default UserSidebar; 