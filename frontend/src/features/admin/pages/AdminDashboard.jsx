import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  Divider
} from '@mui/material';
import UserManagement from '../components/UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage users, roles, and system settings.
        </Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="admin dashboard tabs"
        >
          <Tab label="User Management" />
          <Tab label="System Settings" disabled />
          <Tab label="Logs" disabled />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <UserManagement />
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">System Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon...
          </Typography>
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">System Logs</Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon...
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AdminDashboard; 