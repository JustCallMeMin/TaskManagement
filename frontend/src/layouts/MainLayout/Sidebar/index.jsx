import React, { useState, useEffect, useMemo } from 'react';
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
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import './Sidebar.css';
import { useAuth } from '../../../features/auth/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const { user, loading, authVersion } = useAuth();
  
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.startsWith('/tasks')) {
      setActiveItem('tasks');
    } else if (path.startsWith('/projects')) {
      setActiveItem('projects');
    } else if (path.startsWith('/admin')) {
      setActiveItem('admin');
    }
  }, [location]);

  // Basic menu items for all users
  const basicMenuItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
    { id: 'projects', icon: <ProjectsIcon />, label: 'Projects', path: '/projects' },
    { id: 'tasks', icon: <TasksIcon />, label: 'Tasks', path: '/tasks' },
    { id: 'timeline', icon: <TimelineIcon />, label: 'Timeline', path: '/timeline' },
    { id: 'message', icon: <MessageIcon />, label: 'Message', path: '/messages' },
    { id: 'notify', icon: <NotifyIcon />, label: 'Notify', path: '/notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
    { id: 'files', icon: <FilesIcon />, label: 'Files', path: '/files' },
  ];
  
  // Admin menu item
  const adminMenuItem = { 
    id: 'admin', 
    icon: <AdminIcon />, 
    label: 'Admin', 
    path: '/admin' 
  };
  
  const menuItems = useMemo(() => {
    console.log('Computing menuItems. isAdmin:', user?.isAdmin);
    if (user?.isAdmin) {
      return [
        ...basicMenuItems.slice(0, 3),
        adminMenuItem,
        ...basicMenuItems.slice(3)
      ];
    }
    return basicMenuItems;
  }, [user?.isAdmin, authVersion, basicMenuItems, adminMenuItem]);

  console.log("Rendering Sidebar. isAdmin =", user?.isAdmin, "Menu length =", menuItems.length);

  // Handle loading state in render
  if (loading) {
    console.log('Sidebar waiting for auth to complete...');
    return null;
  }

  return (
    <Box className="sidebar">
      <Link to="/" className="logo">
        <img src="/assets/images/logo.svg" alt="Logo" className="logo-image" />
      </Link>
      <div className="menu">
        {menuItems.map((item) => (
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

export default Sidebar; 