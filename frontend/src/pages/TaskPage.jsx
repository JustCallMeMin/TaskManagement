import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskList from '../features/tasks/components/TaskList';
import TaskForm from '../features/tasks/components/TaskForm';
import TaskDetail from '../features/tasks/components/TaskDetail';

const TaskPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Tasks</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
        >
          New Task
        </Button>
      </Box>

      <Routes>
        <Route path="/" element={<TaskList />} />
        <Route path="/new" element={<TaskForm />} />
        <Route path="/:id" element={<TaskDetail />} />
        <Route path="/:id/edit" element={<TaskForm />} />
      </Routes>
    </Box>
  );
};

export default TaskPage; 