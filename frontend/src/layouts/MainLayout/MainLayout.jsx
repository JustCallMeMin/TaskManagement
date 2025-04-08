import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <Box className="main-layout">
      <Header />
      <Box className="content-container">
        <Sidebar />
        <Box className="main-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 