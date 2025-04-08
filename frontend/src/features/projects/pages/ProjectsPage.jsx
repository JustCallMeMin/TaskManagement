import React from 'react';
import { Box, Container } from '@mui/material';
import ProjectList from '../components/ProjectList';

const ProjectsPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <ProjectList />
      </Box>
    </Container>
  );
};

export default ProjectsPage; 