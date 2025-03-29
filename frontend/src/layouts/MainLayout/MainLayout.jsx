import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <Box className="main-layout">
      <Header />
      <Box className="content-container">
        <Sidebar />
        <Box className="main-content">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 