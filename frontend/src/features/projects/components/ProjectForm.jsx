import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PROJECT_STATUS, PROJECT_STATUS_LABELS } from '../constants/project.constants';

const initialFormState = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'NOT_STARTED'
};

const ProjectForm = ({ open, onClose, onSubmit, project }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  
  const isEditMode = Boolean(project);

  useEffect(() => {
    if (project) {
      // Format dates for the form inputs
      const formattedProject = {
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
      };
      setFormData(formattedProject);
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setSubmitError('');
  }, [project]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear submit error when any change is made
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Error saving project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEditMode ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Project Name"
                value={formData.name || ''}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(errors.name)}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate || ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                value={formData.endDate || ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                error={Boolean(errors.endDate)}
                helperText={errors.endDate}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || 'NOT_STARTED'}
                  onChange={handleChange}
                  label="Status"
                >
                  {Object.entries(PROJECT_STATUS).map(([key, value]) => (
                    <MenuItem key={value} value={value}>
                      {PROJECT_STATUS_LABELS[value] || value.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={onClose} 
            disabled={loading}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              isEditMode ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm; 