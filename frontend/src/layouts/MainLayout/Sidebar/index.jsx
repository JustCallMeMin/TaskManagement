import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
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
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { id: 'projects', icon: <ProjectsIcon />, label: 'Projects' },
    { id: 'tasks', icon: <TasksIcon />, label: 'Tasks' },
    { id: 'timeline', icon: <TimelineIcon />, label: 'Timeline' },
    { id: 'message', icon: <MessageIcon />, label: 'Message' },
    { id: 'notify', icon: <NotifyIcon />, label: 'Notify' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings' },
    { id: 'files', icon: <FilesIcon />, label: 'Files' },
  ];

  return (
    <Box className="sidebar">
      <Link to="/" className="logo">
        <img src="/assets/images/logo.svg" alt="Logo" className="logo-image" />
      </Link>
      <div className="menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item.id)}
          >
            <div className="menu-item-content">
              {item.icon}
              <span className="menu-item-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default Sidebar; 