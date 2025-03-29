import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MDBox from '../../components/MDBox';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <Box className="main-layout">
      <Sidebar />
      <MDBox className="main-content">
        <Header />
        <MDBox py={3} px={3} mt={2}>
          <Outlet />
        </MDBox>
        <Footer />
      </MDBox>
    </Box>
  );
};

export default MainLayout; 