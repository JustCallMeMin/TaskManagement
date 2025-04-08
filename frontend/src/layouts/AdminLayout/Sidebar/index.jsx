import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Dns as ServerIcon,
  Storage as DatabaseIcon,
  Category as CategoriesIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../features/auth/contexts/AuthContext';
import './Sidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('admin-dashboard');
  const { loading } = useAuth();
  
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/dashboard')) {
      setActiveItem('admin-dashboard');
    } else if (path.startsWith('/admin/users')) {
      setActiveItem('users');
    } else if (path.startsWith('/admin/roles')) {
      setActiveItem('roles');
    } else if (path.startsWith('/admin/settings')) {
      setActiveItem('admin-settings');
    } else if (path.startsWith('/admin/categories')) {
      setActiveItem('categories');
    } else if (path.startsWith('/admin/system')) {
      setActiveItem('system');
    }
  }, [location]);

  // Admin menu items
  const adminMenuItems = [
    { id: 'admin-dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'users', icon: <UsersIcon />, label: 'Users', path: '/admin/users' },
    { id: 'roles', icon: <SecurityIcon />, label: 'Roles & Permissions', path: '/admin/roles' },
    { id: 'categories', icon: <CategoriesIcon />, label: 'Categories', path: '/admin/categories' },
    { id: 'system', icon: <ServerIcon />, label: 'System', path: '/admin/system' },
    { id: 'database', icon: <DatabaseIcon />, label: 'Database', path: '/admin/database' },
    { id: 'admin-settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin/settings' },
  ];
  
  // Handle loading state in render
  if (loading) {
    console.log('AdminSidebar waiting for auth to complete...');
    return null;
  }

  return (
    <Box className="sidebar">
      <Link to="/admin/dashboard" className="logo">
        <div className="admin-logo">
          <AdminIcon sx={{ mr: 1 }} />
          <span>Admin Panel</span>
        </div>
      </Link>
      <div className="menu">
        {adminMenuItems.map((item) => (
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
      <div className="sidebar-footer">
        <Link to="/dashboard" className="back-to-app">
          Back to App
        </Link>
      </div>
    </Box>
  );
};

export default AdminSidebar; 