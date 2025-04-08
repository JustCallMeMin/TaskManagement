import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MDBox from '../../components/MDBox';
import Sidebar from './Sidebar';
import Header from '../MainLayout/Header';
import Footer from '../MainLayout/Footer';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <Box className="admin-layout">
      <Sidebar />
      <MDBox className="main-content">
        <Header isAdmin={true} className="admin-header" />
        <MDBox py={3} px={3} mt={2} className="admin-content">
          <Outlet />
        </MDBox>
        <Footer />
      </MDBox>
    </Box>
  );
};

export default AdminLayout; 