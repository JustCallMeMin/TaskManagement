import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { TaskList, TaskDetail, TaskForm } from '../index';

function TaskPage() {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/new" element={<TaskForm />} />
          <Route path="/:id" element={<TaskDetail />} />
          <Route path="/:id/edit" element={<TaskForm />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default TaskPage; 