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
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('dashboard');

  // Update active item based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.startsWith('/tasks')) {
      setActiveItem('tasks');
    } else if (path.startsWith('/projects')) {
      setActiveItem('projects');
    } // Add other path checks as needed
  }, [location]);

  const menuItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
    { id: 'projects', icon: <ProjectsIcon />, label: 'Projects', path: '/projects' },
    { id: 'tasks', icon: <TasksIcon />, label: 'Tasks', path: '/tasks' },
    { id: 'timeline', icon: <TimelineIcon />, label: 'Timeline', path: '/timeline' },
    { id: 'message', icon: <MessageIcon />, label: 'Message', path: '/messages' },
    { id: 'notify', icon: <NotifyIcon />, label: 'Notify', path: '/notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
    { id: 'files', icon: <FilesIcon />, label: 'Files', path: '/files' },
  ];

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