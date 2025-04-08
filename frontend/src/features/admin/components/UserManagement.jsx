import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import adminService from '../services/admin.service';

const ROLES = ['Admin', 'Manager', 'User'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      console.log("Data received in component:", data);
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));
      
      // Ensure we're setting a proper array
      const userArray = Array.isArray(data) ? data : (data && data.length ? data : []);
      console.log("User array to be set:", userArray);
      
      // Force a re-render by creating a new array reference
      setUsers([...userArray]);
      console.log("Users state set with length:", userArray.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, roleName) => {
    try {
      // If empty role is selected, show a confirmation dialog
      if (!roleName) {
        if (!window.confirm("Are you sure you want to remove all roles from this user?")) {
          return;
        }
      }
      
      await adminService.assignRole(userId, roleName || null);
      
      // Update the local state
      setUsers(users.map(user => {
        if (user._id === userId || user.id === userId) {
          return { 
            ...user, 
            roles: roleName ? [roleName] : [] 
          };
        }
        return user;
      }));
      
      // Show success message
      showSnackbar(
        roleName 
          ? `Role for user updated to ${roleName}` 
          : "All roles removed from user", 
        'success'
      );
    } catch (err) {
      console.error('Error updating role:', err);
      showSnackbar('Failed to update role. Please try again.', 'error');
    }
  };
  
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          User Management ({users.length} users)
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary"
            onClick={fetchUsers}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => {
              // Force update by directly updating state with data we already have
              const currentUsers = JSON.parse(localStorage.getItem('debug_users') || '[]');
              if (currentUsers.length > 0) {
                console.log("Force updating with cached data:", currentUsers.length);
                setUsers([...currentUsers]);
              } else {
                // If no cached data, try to force another fetch
                fetchUsers();
              }
            }}
          >
            Force Update
          </Button>
        </Box>
      </Box>

      {/* Store users in localStorage for debug purposes */}
      {users.length > 0 && localStorage.setItem('debug_users', JSON.stringify(users))}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Current Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No users found</TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user._id || user.id}>
                  <TableCell>{user._id || user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {(() => {
                      console.log(`User ${user.fullName} roles:`, user.roles);
                      // Handle different possible formats of roles
                      if (Array.isArray(user.roles) && user.roles.length > 0) {
                        return user.roles.join(', ');
                      } else if (typeof user.roles === 'string') {
                        return user.roles;
                      } else if (user.roles && typeof user.roles === 'object') {
                        return JSON.stringify(user.roles);
                      } else {
                        return 'No role';
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={(() => {
                          // Get the current role
                          if (Array.isArray(user.roles) && user.roles.length > 0) {
                            return user.roles[0];
                          } else if (typeof user.roles === 'string') {
                            return user.roles;
                          } else {
                            // Default to empty string instead of null/undefined
                            return '';
                          }
                        })()}
                        displayEmpty
                        onChange={(e) => handleRoleChange(user._id || user.id, e.target.value)}
                      >
                        <MenuItem value="">
                          <em>No Role</em>
                        </MenuItem>
                        {ROLES.map(role => (
                          <MenuItem key={role} value={role}>{role}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UserManagement; 