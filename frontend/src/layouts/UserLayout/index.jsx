import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MDBox from '../../components/MDBox';
import Sidebar from './Sidebar';
import Header from '../MainLayout/Header';
import Footer from '../MainLayout/Footer';
import './UserLayout.css';

const UserLayout = () => {
  return (
    <Box className="user-layout">
      <Sidebar />
      <MDBox className="main-content">
        <Header isAdmin={false} />
        <MDBox py={3} px={3} mt={2} className="user-content">
          <Outlet />
        </MDBox>
        <Footer />
      </MDBox>
    </Box>
  );
};

export default UserLayout; 